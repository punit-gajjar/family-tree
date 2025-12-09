import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const memberSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dob: z.string().optional().or(z.literal('')),
    aadharNumber: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    nativePlace: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    contactNumber: z.string().optional().or(z.literal('')),
    gender: z.string().optional().or(z.literal('')),
});

// Helper function to extract relations recursively (1 level deep for inference)
const transformSingleMember = (m: any) => {
    const spousesMap = new Map();
    const childrenMap = new Map();
    const parentsMap = new Map();

    const processEdges = (member: any, isDirect: boolean = true) => {
        // Outgoing
        member.outgoingEdges?.forEach((edge: any) => {
            const code = edge.relation.code;
            const target = edge.toMember;
            if (!target) return;

            if (code === 'SPOUSE') {
                if (isDirect) spousesMap.set(target.id, target);
            } else if (code === 'FATHER' || code === 'MOTHER') {
                if (isDirect) childrenMap.set(target.id, target); // I am parent of target
                // If I am looking at my Spouse's edges, My Spouse is Father/Mother of Target. So Target is my Child too.
                else childrenMap.set(target.id, target);
            } else if (code === 'CHILD') {
                if (isDirect) parentsMap.set(target.id, target); // I am child of target
                // If I am looking at my Spouse's edges, My Spouse is Child of Target. Target is my In-Law?
                // Usually we don't list In-Laws as Parents. So ignore CHILD on indirect.
            }
        });

        // Incoming
        member.incomingEdges?.forEach((edge: any) => {
            const code = edge.relation.code;
            const source = edge.fromMember;
            if (!source) return;

            if (code === 'SPOUSE') {
                if (isDirect) spousesMap.set(source.id, source);
            } else if (code === 'FATHER' || code === 'MOTHER') {
                if (isDirect) parentsMap.set(source.id, source); // Source is parent of me
            } else if (code === 'CHILD') {
                if (isDirect) childrenMap.set(source.id, source); // Source is child of me
                else childrenMap.set(source.id, source); // Spouse is child of source? No.
                // If I am checking Spouse. Spouse has explicit child (Source). Yes, add to children.
            }
        });
    };

    // 1. Process Directs
    processEdges(m, true);

    // 2. Infer from Spouses (My Children include my Spouse's children)
    Array.from(spousesMap.values()).forEach((spouse: any) => {
        processEdges(spouse, false);
    });

    // 3. Infer from Parents (My Parents include my Parent's spouses / My step-parents logic)
    // Actually, "Inferred Mother" logic: If A is my Father, and A has Spouse B. B is my Mother.
    Array.from(parentsMap.values()).forEach((parent: any) => {
        // We only care about Spouses of my parents
        parent.outgoingEdges?.forEach((e: any) => { try { if (e.relation.code === 'SPOUSE') parentsMap.set(e.toMember.id, e.toMember); } catch { } });
        parent.incomingEdges?.forEach((e: any) => { try { if (e.relation.code === 'SPOUSE') parentsMap.set(e.fromMember.id, e.fromMember); } catch { } });
    });

    // Remove self from any lists
    parentsMap.delete(m.id);
    childrenMap.delete(m.id);
    spousesMap.delete(m.id);

    // Clean up raw edges from output
    const { outgoingEdges, incomingEdges, ...memberData } = m;
    return {
        ...memberData,
        spouses: Array.from(spousesMap.values()),
        children: Array.from(childrenMap.values()),
        parents: Array.from(parentsMap.values())
    };
}

export const getMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search ? String(req.query.search) : undefined;
        const skip = (page - 1) * limit;

        const deepInclude = {
            outgoingEdges: {
                include: {
                    relation: true,
                    toMember: {
                        include: {
                            outgoingEdges: { include: { relation: true, toMember: true } },
                            incomingEdges: { include: { relation: true, fromMember: true } }
                        }
                    }
                }
            },
            incomingEdges: {
                include: {
                    relation: true,
                    fromMember: {
                        include: {
                            outgoingEdges: { include: { relation: true, toMember: true } },
                            incomingEdges: { include: { relation: true, fromMember: true } }
                        }
                    }
                }
            }
        };

        if (search) {
            const terms = search.trim().split(/\s+/);
            const where: any = {
                AND: terms.map(term => ({
                    OR: [
                        { firstName: { contains: term } },
                        { lastName: { contains: term } }
                    ]
                }))
            };

            const [total, members] = await Promise.all([
                prisma.member.count({ where }),
                prisma.member.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                    include: deepInclude
                })
            ]);

            return res.json({
                data: members.map(transformSingleMember),
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
            });
        }

        // NO search -> Tree Sort
        const allNodes = await prisma.member.findMany({
            select: {
                id: true,
                dob: true,
                outgoingEdges: {
                    where: { relation: { code: { in: ['FATHER', 'MOTHER'] } } },
                    select: { toMemberId: true }
                }
            }
        });

        const parentToChildren = new Map<number, number[]>();
        const hasParent = new Set<number>();

        allNodes.forEach(node => {
            if (!parentToChildren.has(node.id)) parentToChildren.set(node.id, []);
            const children = node.outgoingEdges.map(e => e.toMemberId).sort((a, b) => a - b);
            parentToChildren.get(node.id)?.push(...children);
            children.forEach(childId => hasParent.add(childId));
        });

        const roots = allNodes
            .filter(n => !hasParent.has(n.id))
            .sort((a, b) => {
                if (a.dob && b.dob) return new Date(a.dob).getTime() - new Date(b.dob).getTime();
                return a.id - b.id;
            });

        const sortedIds: number[] = [];
        const visited = new Set<number>();
        const visit = (id: number) => {
            if (visited.has(id)) return;
            visited.add(id);
            sortedIds.push(id);
            parentToChildren.get(id)?.forEach(childId => visit(childId));
        };
        roots.forEach(root => visit(root.id));
        allNodes.forEach(n => { if (!visited.has(n.id)) visit(n.id); });

        const total = sortedIds.length;
        const pageIds = sortedIds.slice(skip, skip + limit);

        const members = await prisma.member.findMany({
            where: { id: { in: pageIds } },
            include: deepInclude
        });

        const membersMap = new Map(members.map(m => [m.id, m]));
        const orderedMembers = pageIds.map(id => membersMap.get(id)).filter(m => m !== undefined);

        res.json({
            data: orderedMembers.map(transformSingleMember),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        });

    } catch (error) {
        next(error);
    }
};

export const getMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const member = await prisma.member.findUnique({
            where: { id: Number(id) }
        });
        if (!member) return res.status(404).json({ message: 'Member not found' });
        res.json(member);
    } catch (error) {
        next(error);
    }
};

export const createMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body = memberSchema.parse(req.body);
        const file = req.file;

        const newMember = await prisma.member.create({
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                dob: body.dob ? new Date(body.dob) : null,
                aadharNumber: body.aadharNumber || null,
                notes: body.notes || null,
                nativePlace: body.nativePlace || null,
                address: body.address || null,
                contactNumber: body.contactNumber || null,
                gender: body.gender || null,
                imageUrl: file ? `/uploads/members/${file.filename}` : null
            }
        });

        res.status(201).json(newMember);
    } catch (error) {
        next(error);
    }
};

export const updateMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const body = memberSchema.parse(req.body);
        const file = req.file;

        const existing = await prisma.member.findUnique({ where: { id: Number(id) } });
        if (!existing) return res.status(404).json({ message: 'Member not found' });

        let imageUrl = existing.imageUrl;
        if (file) {
            if (existing.imageUrl) {
                const oldPath = path.join(process.cwd(), existing.imageUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            imageUrl = `/uploads/members/${file.filename}`;
        }

        const updated = await prisma.member.update({
            where: { id: Number(id) },
            data: {
                firstName: body.firstName,
                lastName: body.lastName,
                dob: body.dob ? new Date(body.dob) : null,
                aadharNumber: body.aadharNumber || null,
                notes: body.notes || null,
                nativePlace: body.nativePlace || null,
                address: body.address || null,
                contactNumber: body.contactNumber || null,
                gender: body.gender || null,
                imageUrl
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

export const deleteMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await prisma.member.delete({ where: { id: Number(id) } });
        res.json({ message: 'Member deleted' });
    } catch (error) {
        next(error);
    }
};
