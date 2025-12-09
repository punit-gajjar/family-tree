import { useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    type Edge as ReactFlowEdge,
    type Node,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import dagre from 'dagre';
import { useQuery } from '@tanstack/react-query';
import FamilyNode from '../components/FamilyNode';
import CoupleNode from '../components/CoupleNode';

interface Edge extends ReactFlowEdge {
    isSpousal?: boolean;
    isParental?: boolean;
}

const nodeTypes = {
    familyMember: FamilyNode,
    couple: CoupleNode,
};

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const nodeWidth = 180;
    const nodeHeight = 120;
    const coupleWidth = 280;
    const horizontalGap = 60;
    const verticalGap = 100;

    const spouseMap = new Map<string, string>();
    const parentToChildren = new Map<string, string[]>();

    edges.forEach(edge => {
        const label = (edge.label as string || '').toLowerCase();
        const isSpousal = edge.isSpousal || ['spouse', 'husband', 'wife'].includes(label);
        const isParental = edge.isParental || ['father', 'mother', 'parent', 'child', 'son', 'daughter'].includes(label);

        if (isSpousal) {
            spouseMap.set(edge.source, edge.target);
            spouseMap.set(edge.target, edge.source);
        } else if (isParental) {
            if (label.includes('child') || label.includes('son') || label.includes('daughter')) {
                const children = parentToChildren.get(edge.target) || [];
                children.push(edge.source);
                parentToChildren.set(edge.target, children);
            } else {
                const children = parentToChildren.get(edge.source) || [];
                children.push(edge.target);
                parentToChildren.set(edge.source, children);
            }
        }
    });

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80 });

    nodes.forEach(node => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    parentToChildren.forEach((children, parent) => {
        children.forEach(child => {
            dagreGraph.setEdge(parent, child);
        });
    });

    dagre.layout(dagreGraph);

    const generations = new Map<number, string[]>();
    const nodeGeneration = new Map<string, number>();

    nodes.forEach(node => {
        const pos = dagreGraph.node(node.id);
        let genKey: number;

        if (!pos) {
            const spouseId = spouseMap.get(node.id);
            if (spouseId && nodeGeneration.has(spouseId)) {
                genKey = nodeGeneration.get(spouseId)!;
            } else {
                genKey = 0;
            }
        } else {
            genKey = Math.round(pos.y / 100);
        }

        nodeGeneration.set(node.id, genKey);
        if (!generations.has(genKey)) {
            generations.set(genKey, []);
        }
        generations.get(genKey)!.push(node.id);
    });

    spouseMap.forEach((spouse2, spouse1) => {
        if (spouse1 < spouse2) {
            const gen1 = nodeGeneration.get(spouse1)!;
            const gen2 = nodeGeneration.get(spouse2)!;
            if (gen1 !== gen2) {
                const oldGen = generations.get(gen2)!;
                const newGen = generations.get(gen1)!;
                const index = oldGen.indexOf(spouse2);
                if (index > -1) {
                    oldGen.splice(index, 1);
                }
                newGen.push(spouse2);
                nodeGeneration.set(spouse2, gen1);
            }
        }
    });

    const finalNodes: Node[] = [];
    const finalEdges: Edge[] = [];
    const processedNodes = new Set<string>();
    const coupleIds = new Map<string, string>();
    const processedEdgePairs = new Set<string>();

    const sortedGens = Array.from(generations.keys()).sort((a, b) => a - b);

    sortedGens.forEach((genKey, genIndex) => {
        const genNodes = generations.get(genKey)!;
        const currentY = genIndex * (nodeHeight + verticalGap) + 50;
        let currentX = 100;

        genNodes.forEach(nodeId => {
            if (processedNodes.has(nodeId)) return;

            const spouseId = spouseMap.get(nodeId);
            const hasSpouse = spouseId && genNodes.includes(spouseId) && !processedNodes.has(spouseId);

            if (hasSpouse) {
                const node1 = nodes.find(n => n.id === nodeId);
                const node2 = nodes.find(n => n.id === spouseId);

                if (node1 && node2) {
                    const coupleNodeId = `couple-${[nodeId, spouseId].sort().join('-')}`;

                    finalNodes.push({
                        id: coupleNodeId,
                        type: 'couple',
                        position: { x: currentX, y: currentY },
                        data: {
                            spouse1: node1.data,
                            spouse2: node2.data,
                        },
                        targetPosition: Position.Top,
                        sourcePosition: Position.Bottom,
                    });

                    coupleIds.set(nodeId, coupleNodeId);
                    coupleIds.set(spouseId!, coupleNodeId);
                    processedNodes.add(nodeId);
                    processedNodes.add(spouseId!);
                    currentX += coupleWidth + horizontalGap;
                }
            } else {
                const node = nodes.find(n => n.id === nodeId);
                if (node) {
                    finalNodes.push({
                        ...node,
                        type: 'familyMember',
                        position: { x: currentX, y: currentY },
                        targetPosition: Position.Top,
                        sourcePosition: Position.Bottom,
                    });
                    processedNodes.add(nodeId);
                    currentX += nodeWidth + horizontalGap;
                }
            }
        });
    });

    parentToChildren.forEach((children, parentId) => {
        children.forEach(childId => {
            const spouseId = spouseMap.get(parentId);
            const otherParentChildren = spouseId ? parentToChildren.get(spouseId) : null;
            const isSharedChild = otherParentChildren && otherParentChildren.includes(childId);

            if (isSharedChild && spouseId) {
                const pairKey = [parentId, spouseId].sort().join('-');
                const edgeKey = `${pairKey}-${childId}`;

                if (!processedEdgePairs.has(edgeKey)) {
                    const coupleId = coupleIds.get(parentId);
                    const childCoupleId = coupleIds.get(childId);
                    const targetId = childCoupleId || childId;

                    if (coupleId) {
                        finalEdges.push({
                            id: `e-${coupleId}-${targetId}`,
                            source: coupleId,
                            target: targetId,
                            type: 'step',
                            style: { stroke: '#64748b', strokeWidth: 2 },
                        });
                    }
                    processedEdgePairs.add(edgeKey);
                }
            } else {
                const parentCoupleId = coupleIds.get(parentId);
                const sourceId = parentCoupleId || parentId;
                const childCoupleId = coupleIds.get(childId);
                const targetId = childCoupleId || childId;

                if (!finalEdges.find((e: Edge) => e.target === targetId && e.source === sourceId)) {
                    finalEdges.push({
                        id: `e-${sourceId}-${targetId}`,
                        source: sourceId,
                        target: targetId,
                        type: 'step',
                        style: { stroke: '#94a3b8', strokeWidth: 2 },
                    });
                }
            }
        });
    });

    return { nodes: finalNodes, edges: finalEdges };
};

export default function TreePage() {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const { data, isLoading } = useQuery({
        queryKey: ['tree-data'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:4000/api/v1/tree', { withCredentials: true });
            return res.data;
        }
    });

    useEffect(() => {
        if (data && data.nodes && data.edges) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                data.nodes,
                data.edges
            );
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }
    }, [data, setNodes, setEdges]);

    if (isLoading) return <div className="h-full flex items-center justify-center text-slate-600">Loading family tree...</div>;

    return (
        <div className="h-[calc(100vh-100px)] w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
                <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">Family Tree</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pedigree Chart</p>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                className="bg-transparent"
                minZoom={0.1}
                maxZoom={2}
            >
                <Controls className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg" />
                <MiniMap
                    zoomable
                    pannable
                    className="!bg-white/95 dark:!bg-slate-900/95 !border-slate-300 dark:!border-slate-700 !shadow-lg"
                    nodeColor="#3b82f6"
                />
                <Background gap={20} size={1} color="#cbd5e1" className="opacity-30" />
            </ReactFlow>
        </div>
    );
}
