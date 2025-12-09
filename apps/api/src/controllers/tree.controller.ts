import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types for dagre/reactflow structure
interface TreeNode {
    id: string;
    type: string;
    data: any;
    position: { x: number, y: number };
}

interface TreeEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
}

export const getTreeData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Fetch all members
        const members = await prisma.member.findMany();

        // 2. Fetch all relationships
        const edges = await prisma.relationshipEdge.findMany({
            include: {
                relation: true
            }
        });

        // 3. Normalize for ReactFlow
        // Nodes
        const nodes = members.map(m => ({
            id: String(m.id),
            data: {
                label: `${m.firstName} ${m.lastName}`,
                image: m.imageUrl,
                ...m
            },
            position: { x: 0, y: 0 }, // Layout will be handled by UI (Dagre)
            // Custom type 'memberNode' could be used if we register it in ReactFlow
            type: 'default'
        }));

        // Edges - Include relation metadata
        // Create a lookup for members to access gender easily
        const memberMap = new Map(members.map(m => [m.id, m]));

        // Edges - Include relation metadata with dynamic labeling
        const flowEdges = edges.map(e => {
            const targetMember = memberMap.get(e.toMemberId);
            let label = e.relation.label;

            if (targetMember?.gender) {
                const g = targetMember.gender.toLowerCase();
                if (label === 'Child') {
                    label = g === 'male' ? 'Son' : (g === 'female' ? 'Daughter' : 'Child');
                } else if (label === 'Spouse') {
                    label = g === 'male' ? 'Husband' : (g === 'female' ? 'Wife' : 'Spouse');
                }
            }

            return {
                id: `e${e.fromMemberId}-${e.toMemberId}`,
                source: String(e.fromMemberId),
                target: String(e.toMemberId),
                label: label,
                isSpousal: e.relation.isSpousal,
                isParental: e.relation.isParental,
                type: 'smoothstep',
                animated: false
            };
        });

        res.json({ nodes, edges: flowEdges });
    } catch (error) {
        next(error);
    }
};
