

import React, { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { Entity, Relationship, EntityType } from '../types';

interface GraphNode extends Entity {
    x?: number;
    y?: number;
}

interface KnowledgeGraphProps {
    entities: Entity[];
    relationships: Relationship[];
    onNodeClick: (node: Entity) => void;
    selectedEntity: Entity | null;
}

const entityColors: Record<EntityType, string> = {
    Person: '#3b82f6', // blue-500
    Organization: '#a855f7', // purple-500
    Location: '#22c55e', // green-500
    Policy: '#eab308', // yellow-500
    Event: '#ef4444', // red-500
    Other: '#6b7280', // gray-500
};

const getNodeColor = (nodeType: EntityType) => entityColors[nodeType] || entityColors['Other'];

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ entities, relationships, onNodeClick, selectedEntity }) => {
    const fgRef = useRef<any>(null);

    useEffect(() => {
        const fg = fgRef.current;
        if (fg) {
            fg.d3Force('charge').strength(-250);
            fg.d3Force('link').distance(120);
            fg.d3Force('center').strength(0.05);
        }
    }, []);

    useEffect(() => {
        const fg = fgRef.current;
        if (fg && selectedEntity) {
            const node: GraphNode | undefined = entities.find(n => n.id === selectedEntity.id);
            if (node) {
                const { x, y } = node;
                if (x !== undefined && y !== undefined) {
                    fg.centerAt(x, y, 500);
                    fg.zoom(2.5, 500);
                }
            }
        } else if (fg) {
            fg.zoomToFit(400, 100);
        }
    }, [selectedEntity, entities]);
    
    const graphData = {
        nodes: entities.map(e => ({ ...e, id: e.id, name: e.name })),
        links: relationships.map(r => ({ ...r, source: r.source, target: r.target }))
    };

    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden shadow-lg relative">
             <h2 className="text-2xl font-semibold text-gray-300 border-l-4 border-cyan-500 pl-4 py-3 bg-gray-800">
                Relationship Graph
            </h2>
            <div className="w-full h-[50vh] md:h-[600px] relative">
                 <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeAutoColorBy="group"
                    nodeCanvasObject={(node: GraphNode, ctx, globalScale) => {
                        const label = node.name;
                        const fontSize = 14 / globalScale;
                        ctx.font = `600 ${fontSize}px Sans-Serif`;
                        
                        const isSelected = selectedEntity && node.id === selectedEntity.id;
                        const color = getNodeColor(node.type);

                        if (isSelected) {
                            ctx.shadowBlur = 15;
                            ctx.shadowColor = color;
                        }

                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = color;
                        ctx.fillText(label, node.x!, node.y! + fontSize * 1.2);
                        
                        ctx.beginPath();
                        ctx.arc(node.x!, node.y!, fontSize * 0.7, 0, 2 * Math.PI, false);
                        ctx.fillStyle = isSelected ? color : 'rgba(20, 30, 40, 0.8)';
                        ctx.fill();
                        
                        if(isSelected) {
                           ctx.lineWidth = 1.5 / globalScale;
                           ctx.strokeStyle = '#fff'; // White border for selected
                           ctx.stroke();
                        } else {
                           ctx.lineWidth = 1 / globalScale;
                           ctx.strokeStyle = color;
                           ctx.stroke();
                        }

                        ctx.shadowBlur = 0; // Reset shadow blur
                    }}
                    linkColor={() => 'rgba(107, 114, 128, 0.5)'}
                    linkWidth={1}
                    onNodeClick={onNodeClick as any}
                />
            </div>
             <div className="absolute bottom-4 right-4 bg-gray-900/70 backdrop-blur-sm p-3 rounded-lg border border-gray-700 text-xs text-gray-300">
                <h4 className="font-bold mb-2">Legend</h4>
                <ul className="space-y-1">
                    {Object.entries(entityColors).map(([type, color]) => (
                        <li key={type} className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                            <span>{type}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};