import { useEffect } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap, 
    Node, 
    Edge,
    Position,
    MarkerType,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Helmet } from 'react-helmet';
import { Spin } from 'antd';
import { useRelationships } from '@/hooks/useRelationships';
import HostNode from '@/components/flow/host-node';
import RemoteNode from '@/components/flow/remote-node';

const nodeTypes = {
    hostNode: HostNode,
    remoteNode: RemoteNode,
};

const Relationships = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { data: relationships, isLoading } = useRelationships();

    const onNodeMouseEnter = (event: any, node: Node) => {
        const connectedEdges = edges.filter(edge => 
            edge.source === node.id || edge.target === node.id
        );
        
        setEdges(edges.map(edge => ({
            ...edge,
            style: connectedEdges.find(e => e.id === edge.id)
                ? { ...edge.style, stroke: '#22c55e', strokeWidth: 3 }
                : edge.style
        })));
    };

    const onNodeMouseLeave = () => {
        setEdges(edges.map(edge => ({
            ...edge,
            style: { ...edge.style, stroke: '#9333ea', strokeWidth: undefined }
        })));
    };

    useEffect(() => {
        if (!relationships) return;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        const hostSpacing = 250;
        const remoteSpacing = 250;
        const hostStartY = 50;
        const remoteStartY = 300;

        // Add host nodes
        relationships.hosts.forEach((host, index) => {
            newNodes.push({
                id: `host-${host.hostId}`,
                data: { 
                    label: host.name,
                    type: 'host',
                    environment: host.environment
                },
                position: { 
                    x: index * hostSpacing + 100, 
                    y: hostStartY 
                },
                type: 'hostNode',
                sourcePosition: Position.Bottom,
                targetPosition: Position.Top,
            });
        });

        // Track remote positions to handle shared remotes
        const remotePositions = new Map<string, { x: number, y: number }>();
        let currentRemoteX = 100;

        // First pass: calculate positions for remotes
        relationships.remotes.forEach((remote) => {
            if (!remotePositions.has(remote.remoteId)) {
                // For remotes with multiple hosts, try to center them
                if (remote.connectedHostIds.length > 1) {
                    // Find the average X position of connected hosts
                    const hostXPositions = remote.connectedHostIds.map(hostId => {
                        const hostIndex = relationships.hosts.findIndex(h => h.hostId === hostId);
                        return hostIndex * hostSpacing + 100;
                    });
                    const avgX = hostXPositions.reduce((a, b) => a + b, 0) / hostXPositions.length;
                    remotePositions.set(remote.remoteId, { 
                        x: avgX, 
                        y: remoteStartY + (Math.random() * 50) // Add slight vertical variation
                    });
                } else {
                    remotePositions.set(remote.remoteId, { 
                        x: currentRemoteX, 
                        y: remoteStartY 
                    });
                    currentRemoteX += remoteSpacing;
                }
            }
        });

        // Add remote nodes and create edges
        relationships.remotes.forEach((remote) => {
            const position = remotePositions.get(remote.remoteId);
            if (position) {
                newNodes.push({
                    id: `remote-${remote.remoteId}`,
                    data: { 
                        label: remote.name,
                        type: 'remote',
                        key: remote.key
                    },
                    position,
                    type: 'remoteNode',
                    sourcePosition: Position.Top,
                    targetPosition: Position.Bottom,
                });

                // Create edges from hosts to this remote
                remote.connectedHostIds.forEach(hostId => {
                    newEdges.push({
                        id: `edge-${hostId}-${remote.remoteId}`,
                        source: `host-${hostId}`,
                        target: `remote-${remote.remoteId}`,
                        type: 'smoothstep',
                        animated: true,
                        style: { 
                            stroke: '#9333ea',
                            transition: 'stroke 0.3s ease',
                            '&:hover': {
                                stroke: '#22c55e'
                            }
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#9333ea',
                        },
                    });
                });
            }
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [relationships]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>[ROS] | Relationships</title>
                <meta name="description" content="Dream.mf [ROS] | Relationships Page" />
            </Helmet>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Relationships</h1>
            </div>
            <div style={{ height: 'calc(100vh - 200px)' }} className="border rounded-lg overflow-hidden dark:border-gray-700">
                <style>
                    {`
                        .react-flow__edge:hover {
                            z-index: 1000 !important;
                        }
                        .react-flow__edge:hover path,
                        .react-flow__node:hover + .react-flow__edge path,
                        .react-flow__node:hover ~ .react-flow__edge path {
                            stroke: #22c55e !important;
                            stroke-width: 3 !important;
                            transition: all 0.3s ease;
                        }
                        .react-flow__edge:hover path.react-flow__edge-path,
                        .react-flow__node:hover + .react-flow__edge path.react-flow__edge-path,
                        .react-flow__node:hover ~ .react-flow__edge path.react-flow__edge-path {
                            stroke: #22c55e !important;
                            stroke-width: 3 !important;
                        }
                        .react-flow__edge:hover .react-flow__edge-path,
                        .react-flow__node:hover + .react-flow__edge .react-flow__edge-path,
                        .react-flow__node:hover ~ .react-flow__edge .react-flow__edge-path {
                            stroke: #22c55e !important;
                            stroke-width: 3 !important;
                        }
                        .react-flow__node:hover {
                            z-index: 1000 !important;
                        }
                    `}
                </style>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeMouseEnter={onNodeMouseEnter}
                    onNodeMouseLeave={onNodeMouseLeave}
                    fitView
                    attributionPosition="bottom-right"
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        animated: true,
                        style: { 
                            stroke: '#9333ea',
                            transition: 'stroke 0.3s ease',
                            '&:hover': {
                                stroke: '#22c55e'
                            }
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#9333ea',
                        },
                    }}
                >
                    <Background />
                    <Controls />
                    <MiniMap 
                        nodeStrokeColor="#9333ea"
                        nodeColor="#f3e8ff"
                        style={{ backgroundColor: '#1e1e1e' }}
                        maskColor="rgba(30, 30, 30, 0.8)"
                    />
                </ReactFlow>
            </div>
        </>
    );
};

export default Relationships;
