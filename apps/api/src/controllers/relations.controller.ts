import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod'; // Keep z import for schema validation if needed later

const prisma = new PrismaClient();

const createEdgeSchema = z.object({
    fromMemberId: z.number(),
    toMemberId: z.number(),
    relationCode: z.string() // Send code (e.g., FATHER), backend looks up ID
});

// --- Masters CRUD ---

export const getRelationMasters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const masters = await prisma.relationMaster.findMany();
        res.json(masters);
    } catch (error) {
        next(error);
    }
};

export const createRelationMaster = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code, label, isBidirectional, isSpousal, isParental, inverseCode } = req.body;
        const master = await prisma.relationMaster.create({
            data: { code, label, isBidirectional, isSpousal, isParental, inverseCode }
        });
        res.status(201).json(master);
    } catch (error) {
        next(error);
    }
};

export const updateRelationMaster = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { code, label, isBidirectional, isSpousal, isParental, inverseCode } = req.body;
        const master = await prisma.relationMaster.update({
            where: { id: Number(id) },
            data: { code, label, isBidirectional, isSpousal, isParental, inverseCode }
        });
        res.json(master);
    } catch (error) {
        next(error);
    }
};

export const deleteRelationMaster = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.relationMaster.delete({ where: { id: Number(id) } });
        res.json({ message: 'Relation Master deleted' });
    } catch (error) {
        next(error);
    }
};

// --- Relationships (Edges) CRUD ---

export const getRelationships = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { memberId } = req.query;
        if (!memberId) return res.status(400).json({ message: 'memberId is required' });

        // Get edges where member is 'from'
        const edges = await prisma.relationshipEdge.findMany({
            where: { fromMemberId: Number(memberId) },
            include: {
                toMember: true,
                relation: true
            }
        });

        res.json(edges);
    } catch (error) {
        next(error);
    }
};

export const createRelationship = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fromMemberId, toMemberId, relationCode } = createEdgeSchema.parse(req.body);

        if (fromMemberId === toMemberId) {
            return res.status(400).json({ message: 'Cannot create relationship to self' });
        }

        // 1. Find the relation master
        const relation = await prisma.relationMaster.findUnique({
            where: { code: relationCode }
        });

        if (!relation) {
            return res.status(404).json({ message: 'Relation type not found' });
        }

        // 2. Create the primary edge
        const edge = await prisma.relationshipEdge.create({
            data: {
                fromMemberId,
                toMemberId,
                relationId: relation.id
            }
        });

        // 3. Handle Inverse / Bidirectional
        // If bidirectional (e.g. Spouse), create B -> A with same relation
        if (relation.isBidirectional) {
            // Check if exists to avoid error if unique constraint
            const exists = await prisma.relationshipEdge.findFirst({
                where: { fromMemberId: toMemberId, toMemberId: fromMemberId, relationId: relation.id }
            });
            if (!exists) {
                await prisma.relationshipEdge.create({
                    data: {
                        fromMemberId: toMemberId,
                        toMemberId: fromMemberId,
                        relationId: relation.id
                    }
                });
            }
        }
        // If it has an inverse code (e.g. Father -> Child)
        else if (relation.inverseCode) {
            const inverseRelation = await prisma.relationMaster.findUnique({
                where: { code: relation.inverseCode }
            });

            if (inverseRelation) {
                const exists = await prisma.relationshipEdge.findFirst({
                    where: { fromMemberId: toMemberId, toMemberId: fromMemberId, relationId: inverseRelation.id }
                });
                if (!exists) {
                    await prisma.relationshipEdge.create({
                        data: {
                            fromMemberId: toMemberId,
                            toMemberId: fromMemberId,
                            relationId: inverseRelation.id
                        }
                    });
                }
            }
        }

        res.status(201).json(edge);
    } catch (error) {
        next(error);
    }
};

export const deleteRelationship = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const edgeId = Number(id);

        // Get the edge to know details before deleting
        const edge = await prisma.relationshipEdge.findUnique({
            where: { id: edgeId },
            include: { relation: true }
        });

        if (!edge) return res.status(404).json({ message: 'Edge not found' });

        // Delete primary
        await prisma.relationshipEdge.delete({ where: { id: edgeId } });

        // Delete inverse logic
        if (edge.relation.isBidirectional) {
            await prisma.relationshipEdge.deleteMany({
                where: {
                    fromMemberId: edge.toMemberId,
                    toMemberId: edge.fromMemberId,
                    relationId: edge.relationId
                }
            });
        }
        else if (edge.relation.inverseCode) {
            const inverseRelation = await prisma.relationMaster.findUnique({
                where: { code: edge.relation.inverseCode }
            });
            if (inverseRelation) {
                await prisma.relationshipEdge.deleteMany({
                    where: {
                        fromMemberId: edge.toMemberId,
                        toMemberId: edge.fromMemberId,
                        relationId: inverseRelation.id
                    }
                });
            }
        }

        res.json({ message: 'Relationship deleted' });
    } catch (error) {
        next(error);
    }
};
