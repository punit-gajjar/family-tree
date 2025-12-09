import dagre from 'dagre';
import { type Node, type Edge, Position } from '@xyflow/react';

export interface TreeData {
    nodes: any[];
    edges: any[];
}

export const getLayoutedElements = (nodes: any[], edges: any[], direction: string = 'TB') => {
    const nodeWidth = 220;
    const nodeHeight = 100;
    const coupleWidth = 400; // Width for two people side-by-side
    const rankSep = 80;
    const nodeSep = 40;

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, nodesep: nodeSep, ranksep: rankSep, ranker: 'network-simplex' });

    // Maps
    const spouseMap = new Map<string, string>();
    const parentMap = new Map<string, string[]>(); // childId -> [parentIds]
    const childrenMap = new Map<string, string[]>(); // parentId -> [childIds]
    const coupleIdMap = new Map<string, string>(); // personId -> coupleNodeId

    // 1. Identification Phase
    edges.forEach((edge: any) => {
        const label = (edge.label || '').toLowerCase();
        const isSpousal = edge.isSpousal || ['spouse', 'husband', 'wife'].includes(label);
        const isParental = edge.isParental || ['father', 'mother', 'parent', 'child', 'son', 'daughter'].includes(label);

        if (isSpousal) {
            spouseMap.set(edge.source, edge.target);
            spouseMap.set(edge.target, edge.source);
        } else if (isParental) {
            // Standardize direction: Source=Parent, Target=Child
            let parent = edge.source;
            let child = edge.target;

            // Check if label implies reversed edge (Child -> Parent)
            if (label.includes('father') || label.includes('mother') || label.includes('parent')) {
                // Usually these labels imply Target is the Parent, but let's check assumptions. 
                // If edge is "X is father of Y", then X->Y (Parent->Child).
                // If edge is "X has father Y", then X->Y (Child->Parent).
                // Based on common data models, let's assume standard Source->Target is Parent->Child unless explicitly reversed by logic.
                // However, the existing code handled:
                // if (label.includes('child')...) -> target is parent? No, "X is child of Y" -> X->Y?
                // Let's stick to the previous logic interpretation or enforce a standard.
                // Previous logic: 
                // if parent labels: children = parentToChildren.get(edge.target) -> implies edge.target is parent, edge.source is child.
                // Wait, if label is 'child', usually it means "Source is child of Target".
            }

            // Re-evaluating based on previous code:
            if (label.includes('child') || label.includes('son') || label.includes('daughter')) {
                // "Source is child of Target"
                parent = edge.target;
                child = edge.source;
            } else {
                // "Source is Parent of Target"
                parent = edge.source;
                child = edge.target;
            }

            if (!childrenMap.has(parent)) childrenMap.set(parent, []);
            childrenMap.get(parent)!.push(child);

            if (!parentMap.has(child)) parentMap.set(child, []);
            parentMap.get(child)!.push(parent);
        }
    });

    // 2. Grouping Phase
    const processedCouples = new Set<string>();

    // Logic to create couple nodes
    nodes.forEach(node => {
        if (coupleIdMap.has(node.id)) return;

        const spouseId = spouseMap.get(node.id);
        if (spouseId) {
            // It's a couple
            const pairId = [node.id, spouseId].sort().join('-');
            const coupleNodeId = `couple-${pairId}`;

            if (!processedCouples.has(pairId)) {
                processedCouples.add(pairId);

                // Add couple node to graph
                dagreGraph.setNode(coupleNodeId, { width: coupleWidth, height: nodeHeight });
            }

            coupleIdMap.set(node.id, coupleNodeId);
        } else {
            // Single node
            dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        }
    });

    // 3. Edge Phase
    // Edges should go from Couple/Individual -> Couple/Individual
    // Step edges are purely visual, Dagre needs logical hierarchy.

    // We iterate over children relationships
    childrenMap.forEach((children, parentId) => {
        const sourceId = coupleIdMap.get(parentId) || parentId;

        children.forEach(childId => {
            const targetId = coupleIdMap.get(childId) || childId;

            // Avoid duplicate edges between same two nodes
            const edgeName = `${sourceId}-${targetId}`;

            // We only need one edge per relationship for dagre
            // If both parents point to same child, we only add one edge from their CoupleNode
            dagreGraph.setEdge(sourceId, targetId);
        });
    });

    // 4. Layout
    dagre.layout(dagreGraph);

    // 5. Expansion Phase
    const finalNodes: Node[] = [];
    const finalEdges: Edge[] = [];

    // Create Nodes
    // Create Nodes
    dagreGraph.nodes().forEach(nodeId => {
        const nodeWithPosition = dagreGraph.node(nodeId);

        if (nodeId.startsWith('couple-')) {
            // It's a couple node, we need to find the original two people
            // The ID format is `couple-ID1-ID2`
            const raw = nodeId.replace('couple-', '');
            const [id1, id2] = raw.split('-');

            const p1 = nodes.find(n => n.id === id1);
            const p2 = nodes.find(n => n.id === id2);

            finalNodes.push({
                id: nodeId,
                type: 'couple',
                position: {
                    x: nodeWithPosition.x - (coupleWidth / 2),
                    y: nodeWithPosition.y - (nodeHeight / 2)
                },
                data: {
                    spouse1: p1 ? p1.data : {},
                    spouse2: p2 ? p2.data : {}
                },
                width: coupleWidth,
                height: nodeHeight,
                targetPosition: Position.Top,
                sourcePosition: Position.Bottom,
            });

        } else {
            // Single node
            const originalNode = nodes.find(n => n.id === nodeId);
            if (originalNode) {
                finalNodes.push({
                    ...originalNode,
                    type: 'familyMember',
                    position: {
                        x: nodeWithPosition.x - (nodeWidth / 2),
                        y: nodeWithPosition.y - (nodeHeight / 2)
                    },
                    width: nodeWidth,
                    height: nodeHeight,
                    targetPosition: Position.Top,
                    sourcePosition: Position.Bottom,
                });
            }
        }
    });

    // Create Edges
    dagreGraph.edges().forEach(e => {
        finalEdges.push({
            id: `e-${e.v}-${e.w}`,
            source: e.v,
            target: e.w,
            type: 'step', // Use step type for orthogonal lines
            style: { stroke: '#94a3b8', strokeWidth: 2 },
        });
    });

    return { nodes: finalNodes, edges: finalEdges };
};
