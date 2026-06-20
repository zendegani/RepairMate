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

const CATEGORY: Record<FlowNodeDto["kind"], { color: string; label: string }> = {
  input: { color: "#39d98a", label: "Input" },
  agent: { color: "#6aa9e9", label: "Agent" },
  decision: { color: "#e8a24a", label: "Decision" },
  output: { color: "#a78bfa", label: "Output" },
};

function RepairNode({
  data,
}: NodeProps<Node<{ label: string; kind: FlowNodeDto["kind"] }>>) {
  const category = CATEGORY[data.kind];
  return (
    <div
      className="min-w-[150px] rounded-lg border border-white/15 bg-raised px-3.5 py-2.5 shadow-panel"
      style={{ borderLeft: `3px solid ${category.color}` }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-signal"
      />
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: category.color }}
        />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
          {data.kind}
        </span>
      </div>
      <div className="mt-0.5 font-display text-sm font-medium text-chalk">
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-signal"
      />
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
    <div className="overflow-hidden rounded-lg border border-white/10 bg-housing">
      <div className="h-[300px]">
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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 px-4 py-2.5">
        {Object.values(CATEGORY).map((category) => (
          <span
            key={category.label}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted"
          >
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: category.color }}
            />
            {category.label}
          </span>
        ))}
      </div>
    </div>
  );
}
