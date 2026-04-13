import { useMemo } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { NodeCard, NodeCardData } from './NodeCard';

export interface TreeNode extends NodeCardData {
  id: string;
  parent_id?: string | null;
  depth: number;
}

const nodeTypes = { card: NodeCard };

function layout(tree: TreeNode[]): { nodes: Node[]; edges: Edge[] } {
  const byDepth: Record<number, TreeNode[]> = {};
  tree.forEach((n) => {
    (byDepth[n.depth] ??= []).push(n);
  });
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const H_SPACING = 240;
  const V_SPACING = 160;
  Object.keys(byDepth).forEach((d) => {
    const list = byDepth[+d];
    list.forEach((n, i) => {
      nodes.push({
        id: n.id,
        type: 'card',
        position: { x: i * H_SPACING - ((list.length - 1) * H_SPACING) / 2, y: +d * V_SPACING },
        data: n,
      });
      if (n.parent_id) edges.push({ id: `${n.parent_id}-${n.id}`, source: n.parent_id, target: n.id });
    });
  });
  return { nodes, edges };
}

export function TreeView({ tree, onLoadMore }: { tree: TreeNode[]; onLoadMore?: () => void }) {
  const { nodes, edges } = useMemo(() => layout(tree), [tree]);

  return (
    <div className="h-[600px] card relative">
      <ReactFlowProvider>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
      {onLoadMore && (
        <button className="btn-secondary absolute bottom-4 right-4 z-10" onClick={onLoadMore}>
          Ver mais níveis
        </button>
      )}
    </div>
  );
}
