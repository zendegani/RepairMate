"use client";

import {
  Background,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FlowEdgeDto, FlowNodeDto } from "@/lib/types";

const nodeBorder: Record<FlowNodeDto["kind"], string> = {
  input: "border-signal/70",
  agent: "border-white/25",
  decision: "border-caution/70",
  output: "border-signal/40",
};

function RepairNode({
  data,
}: NodeProps<Node<{ label: string; kind: FlowNodeDto["kind"] }>>) {
  return (
    <div
      className={`min-w-[150px] rounded-lg border bg-raised px-3.5 py-2.5 shadow-panel ${nodeBorder[data.kind]}`}
    >
      <Handle type="target" position={Position.Left} className="!h-1.5 !w-1.5 !border-0 !bg-signal" />
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
        {data.kind}
      </div>
      <div className="mt-0.5 font-display text-sm font-medium text-chalk">
        {data.label}
      </div>
      <Handle type="source" position={Position.Right} className="!h-1.5 !w-1.5 !border-0 !bg-signal" />
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
    label: edge.label ?? undefined,
    animated: true,
    style: { stroke: "#39d98a", strokeWidth: 1.5 },
    labelStyle: { fill: "#7b918a", fontFamily: "var(--font-mono)", fontSize: 10 },
    labelBgStyle: { fill: "#101a17", fillOpacity: 0.95 },
    labelBgPadding: [5, 3] as [number, number],
    labelBgBorderRadius: 3,
  }));

  return (
    <div className="h-[320px] overflow-hidden rounded-lg border border-white/10 bg-housing">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1c2a26" gap={22} />
      </ReactFlow>
    </div>
  );
}
