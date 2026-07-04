import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { 
  addEdge, applyNodeChanges, applyEdgeChanges, Background, Controls, Panel 
} from 'reactflow';
import 'reactflow/dist/style.css';

import Sidebar from './components/Sidebar';
import InputNode from './nodes/InputNode';
import GateNode from './nodes/GateNode';
import OutputNode from './nodes/OutputNode';
import GlowingEdge from './edges/GlowingEdge';
import { evaluateCircuit } from './utils/logicEngine';

const nodeTypes = { inputNode: InputNode, gateNode: GateNode, outputNode: OutputNode };
const edgeTypes = { glowing: GlowingEdge };

let id = 0;
const getId = () => `node_${id++}`;

export default function App() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // 1. THE FIX: State Refs to prevent stale closures and infinite loops
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  // Undo/Redo State History
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  // Snapshot now uses the refs, meaning it never causes a re-render!
  const takeSnapshot = useCallback(() => {
    setPast((p) => [...p.slice(-15), { nodes: nodesRef.current, edges: edgesRef.current }]);
    setFuture([]);
  }, []);

  // Keyboard Event Listener for Undo (Ctrl+Z) / Redo (Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (past.length > 0) {
          const previous = past[past.length - 1];
          setFuture((f) => [{ nodes: nodesRef.current, edges: edgesRef.current }, ...f]);
          setPast((p) => p.slice(0, -1));
          setNodes(previous.nodes);
          setEdges(previous.edges);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        if (future.length > 0) {
          const next = future[0];
          setPast((p) => [...p, { nodes: nodesRef.current, edges: edgesRef.current }]);
          setFuture((f) => f.slice(1));
          setNodes(next.nodes);
          setEdges(next.edges);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [past, future]); 

  const toggleInput = useCallback((nodeId) => {
    takeSnapshot();
    setNodes((nds) => nds.map((node) => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, value: node.data.value === 1 ? 0 : 1 } };
      }
      return node;
    }));
  }, [takeSnapshot]);

  // 2. THE FIX: Bail out of the update if no switches needed attaching
  useEffect(() => {
    setNodes((nds) => {
      let changed = false;
      const newNodes = nds.map((n) => {
        if (n.type === 'inputNode' && !n.data.toggleValue) {
          changed = true;
          return { ...n, data: { ...n.data, toggleValue: () => toggleInput(n.id) } };
        }
        return n;
      });
      return changed ? newNodes : nds; // If nothing changed, skip the update!
    });
  }, [toggleInput, nodes.length]); 

  // Circuit Evaluation Engine
  useEffect(() => {
    const { updatedNodes, edgeStates } = evaluateCircuit(nodes, edges);
    const updatedEdges = edges.map(edge => ({
      ...edge,
      data: { ...edge.data, value: edgeStates[edge.id] || 0 }
    }));

    if (JSON.stringify(nodes.map(n => n.data.value)) !== JSON.stringify(updatedNodes.map(n => n.data.value))) {
      setNodes(updatedNodes);
    }
    if (JSON.stringify(edges.map(e => e.data?.value)) !== JSON.stringify(updatedEdges.map(e => e.data?.value))) {
      setEdges(updatedEdges);
    }
  }, [nodes, edges]);

  // Handle deletions & movement (taking snapshot on specific actions)
  const onNodesChange = useCallback((changes) => {
    if (changes.some(c => c.type === 'remove' || c.type === 'add')) takeSnapshot();
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [takeSnapshot]);

  const onEdgesChange = useCallback((changes) => {
    if (changes.some(c => c.type === 'remove' || c.type === 'add')) takeSnapshot();
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [takeSnapshot]);

  const onConnect = useCallback((connection) => {
    takeSnapshot();
    setEdges((eds) => addEdge({ ...connection, type: 'glowing' }, eds));
  }, [takeSnapshot]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const gateType = event.dataTransfer.getData('application/gateType');

      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode = {
        id: getId(), type, position,
        data: { gateType: gateType || undefined, value: 0, inputs: {} },
      };

      takeSnapshot();
      setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, takeSnapshot]);

  return (
    <div className="w-screen h-screen bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes} edges={edges}
          nodeTypes={nodeTypes} edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop} onDragOver={onDragOver}
          deleteKeyCode={['Backspace', 'Delete']}
          fitView
        >
          <Background color="#1e293b" gap={20} size={2} />
          <Controls className="bg-slate-800 border-none shadow-lg" />
          <Panel position="bottom-center" className="bg-slate-800/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-2xl mb-6 text-slate-300 min-w-[320px]">
  <h1 className="font-bold text-white text-xl text-center">Logic Gates Creator</h1>
  <div className="flex justify-center items-center gap-2 mt-2">
    <span className="text-xs text-slate-400">Created with ❤️ by</span>
    <a 
      href="https://www.instagram.com/vams.i_madhav_79" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-bold"
    >
      {/* Instagram SVG Icon */}
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808 0 2.43-.013 2.784-.06 3.808-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06-2.43 0-2.784-.013-3.808-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808 0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.06-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.536 2.013 8.89 2 11.32 2h.995zm0 2.162c-2.39 0-2.673.01-3.614.053-.878.04-1.356.18-1.673.303-.42.163-.72.358-1.036.673-.315.315-.51.616-.673 1.036-.123.317-.263.795-.303 1.673-.043.941-.053 1.224-.053 3.614 0 2.39.01 2.673.053 3.614.04.878.18 1.356.303 1.673.163.42.358.72.673 1.036.315.315.616.51 1.036.673.317.123.795.263 1.673.303.941.043 1.224.053 3.614.053 2.39 0 2.673-.01 3.614-.053.878-.04 1.356-.18 1.673-.303.42-.163.72-.358 1.036-.673.315-.315.51-.616.673-1.036.123-.317.263-.795.303-1.673.043-.941.053-1.224.053-3.614 0-2.39-.01-2.673-.053-3.614-.04-.878-.18-1.356-.303-1.673-.163-.42-.358-.72-.673-1.036-.315-.315-.616-.51-1.036-.673-.317-.123-.795-.263-1.673-.303-.941-.043-1.224-.053-3.614-.053zM12 6.64a5.36 5.36 0 100 10.72 5.36 5.36 0 000-10.72zm0 8.556a3.196 3.196 0 110-6.392 3.196 3.196 0 010 6.392zm6.208-8.232a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" clipRule="evenodd" />
      </svg>
      @vams.i_madhav_79
    </a>
  </div>
</Panel>
        </ReactFlow>
      </div>
    </div>
  );
}