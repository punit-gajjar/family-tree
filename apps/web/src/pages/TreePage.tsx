import { useEffect, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Rows, Columns } from 'lucide-react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    type Edge as ReactFlowEdge,
    type Node,
    ReactFlowProvider,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';

import { useQuery } from '@tanstack/react-query';
import FamilyNode from '../components/FamilyNode';
import CoupleNode from '../components/CoupleNode';
import Loader from '../components/ui/Loader';
import { useLanguage } from '../context/LanguageContext';

import { getLayoutedElements } from '../lib/algorithms';

interface Edge extends ReactFlowEdge {
    isSpousal?: boolean;
    isParental?: boolean;
}

const nodeTypes = {
    familyMember: FamilyNode,
    couple: CoupleNode,
};

const getNodesBounds = (nodes: Node[]) => {
    if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
        const x = node.position.x;
        const y = node.position.y;
        // Use dimensions from algorithms or fallback
        const w = node.width ?? 0;
        const h = node.height ?? 0;

        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x + w > maxX) maxX = x + w;
        if (y + h > maxY) maxY = y + h;
    });

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
};

function DownloadButton() {
    const { getNodes } = useReactFlow();
    const { t } = useLanguage();

    const onClick = () => {
        const nodes = getNodes();
        if (nodes.length === 0) return;

        const nodesBounds = getNodesBounds(nodes);
        const padding = 50;
        const width = nodesBounds.width + (padding * 2);
        const height = nodesBounds.height + (padding * 2);

        const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;

        if (!viewport) return;

        toPng(viewport, {
            backgroundColor: '#ffffff',
            width: width,
            height: height,
            style: {
                width: `${width}px`,
                height: `${height}px`,
                transform: `translate(${-nodesBounds.x + padding}px, ${-nodesBounds.y + padding}px)`,
                transformOrigin: 'top left',
            },
        }).then((dataUrl) => {
            const a = document.createElement('a');
            a.setAttribute('download', 'family-tree.png');
            a.setAttribute('href', dataUrl);
            a.click();
        });
    };

    return (
        <button
            onClick={onClick}
            className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-lg text-slate-700 dark:text-slate-200 hover:glass-card shadow-md hover:shadow-lg transition-all duration-300 text-sm font-medium"
        >
            <Download className="h-4 w-4" />
            {t('common.download')}
        </button>
    );
}

function TreePageContent() {
    const { t } = useLanguage();
    const [direction, setDirection] = useState<'TB' | 'LR'>('TB');
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const { data, isLoading } = useQuery({
        queryKey: ['tree-data'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:4000/api/v1/tree', { withCredentials: true });
            return res.data;
        }
    });

    useEffect(() => {
        if (data) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                data.nodes,
                data.edges,
                direction
            );
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        }
    }, [data, direction, setNodes, setEdges]);

    if (isLoading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <Loader size="lg" text={t('tree.building')} />
            </div>
        );
    }

    return (
        <ReactFlowProvider>
            <div className="h-[calc(100vh-12rem)] w-full glass-card rounded-2xl shadow-lg overflow-hidden relative">
                <div className="absolute top-4 left-4 z-40 flex gap-2">
                    <DownloadButton />
                    <div className="flex gap-1 glass-panel rounded-lg p-1 shadow-md">
                        <button
                            onClick={() => setDirection('LR')}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${direction === 'LR'
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'
                                }`}
                        >
                            <Columns className="h-4 w-4" />
                            {t('tree.horizontal')}
                        </button>
                        <button
                            onClick={() => setDirection('TB')}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${direction === 'TB'
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'
                                }`}
                        >
                            <Rows className="h-4 w-4" />
                            {t('tree.vertical')}
                        </button>
                    </div>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        animated: false,
                    }}
                >
                    <Background />
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </div>
        </ReactFlowProvider>
    );
}

export default function TreePage() {
    return <TreePageContent />;
}
