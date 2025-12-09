import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [
            totalMembers,
            totalEdges,
            recentMembers
        ] = await Promise.all([
            prisma.member.count(),
            prisma.relationshipEdge.count(),
            prisma.member.findMany({
                orderBy: { updatedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    updatedAt: true,
                    imageUrl: true
                }
            })
        ]);

        // Estimate families (very rough approximation: spousal edges / 2)
        const spousalEdges = await prisma.relationshipEdge.count({
            where: { relation: { isSpousal: true } }
        });
        const totalFamilies = Math.ceil(spousalEdges / 2);

        res.json({
            totalMembers,
            totalRelationships: totalEdges,
            totalFamilies,
            recentMembers
        });
    } catch (error) {
        next(error);
    }
};
