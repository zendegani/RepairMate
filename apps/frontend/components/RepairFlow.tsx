"use client";

import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FlowEdgeDto, FlowNodeDto } from "@/lib/types";

const nodeColors: Record<FlowNodeDto["kind"], string> = {
  input: "border-repair bg-white",
  agent: "border-copper bg-white",
  decision: "border-ink bg-mint",
  output: "border-graphite bg-white",
};

function RepairNode({ data }: NodeProps<Node<{ label: string; kind: FlowNodeDto["kind"] }>>) {
  return (
    <div className={`min-w-40 rounded-md border-2 px-4 py-3 text-sm font-semibold text-ink shadow-sm ${nodeColors[data.kind]}`}>
      <Handle type="target" position={Position.Left} className="!bg-graphite" />
      {data.label}
      <Handle type="source" position={Position.Right} className="!bg-graphite" />
    </div>
  );
}

const nodeTypes = {
  repairNode: RepairNode,
};

const positions = [
  { x: 0, y: 90 },
  { x: 230, y: 20 },
  { x: 460, y: 20 },
  { x: 690, y: 90 },
  { x: 920, y: 20 },
  { x: 920, y: 160 },
];

type RepairFlowProps = {
  nodes: FlowNodeDto[];
  edges: FlowEdgeDto[];
};

export function RepairFlow({ nodes, edges }: RepairFlowProps) {
  const flowNodes: Node[] = nodes.map((node, index) => ({
    id: node.id,
    type: "repairNode",
    position: positions[index] ?? { x: index * 210, y: 80 },
    data: { label: node.label, kind: node.kind },
  }));

  const flowEdges: Edge[] = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    animated: true,
    style: { stroke: "#176b58", strokeWidth: 2 },
  }));

  return (
    <div className="h-[340px] overflow-hidden rounded-lg border border-black/10 bg-white">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        nodesDraggable={false}
      >
        <Background color="#d7ded9" gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
