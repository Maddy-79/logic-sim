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
  
  const [truthTable, setTruthTable] = useState(null);

  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const takeSnapshot = useCallback(() => {
    setPast((p) => [...p.slice(-15), { nodes: nodesRef.current, edges: edgesRef.current }]);
    setFuture([]);
  }, []);

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
      return changed ? newNodes : nds;
    });
  }, [toggleInput, nodes.length]); 

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

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(flow));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "my_circuit.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  }, [reactFlowInstance]);

  const onLoad = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target.result);
          if (flow) {
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            takeSnapshot(); 
          }
        } catch (err) {
          alert("Invalid circuit file!");
        }
      };
      reader.readAsText(file);
    }
  }, [takeSnapshot]);

  const generateTruthTable = () => {
    const inputs = nodes.filter(n => n.type === 'inputNode');
    const outputs = nodes.filter(n => n.type === 'outputNode');
    
    // EXISTING CHECK
    if (inputs.length === 0 || outputs.length === 0) {
      alert("You need at least one input and one output to generate a table.");
      return;
    }

    // NEW CHECK: Verify if outputs are connected
    const connectedOutputs = outputs.filter(output => {
      return edges.some(edge => edge.target === output.id);
    });

    if (connectedOutputs.length === 0) {
      alert("Please connect your output bulb(s) to the circuit.");
      return;
    }

    if (inputs.length > 4) {
      alert("Truth table limited to 4 inputs (16 rows) for performance.");
      return;
    }

    const numRows = Math.pow(2, inputs.length);
    const tableData = [];

    for (let i = 0; i < numRows; i++) {
      let tempNodes = nodes.map(node => {
        if (node.type === 'inputNode') {
          const inputIndex = inputs.findIndex(inp => inp.id === node.id);
          const val = (i >> (inputs.length - 1 - inputIndex)) & 1;
          return { ...node, data: { ...node.data, value: val } };
        }
        return node;
      });

      const { updatedNodes } = evaluateCircuit(tempNodes, edges);
      
      const rowResult = {
        inputs: tempNodes.filter(n => n.type === 'inputNode').map(n => n.data.value),
        outputs: updatedNodes.filter(n => n.type === 'outputNode').map(n => n.data.value)
      };
      tableData.push(rowResult);
    }

    let gateIdentity = "Custom Circuit";
    if (inputs.length === 2 && outputs.length === 1) {
      const outValues = tableData.map(row => row.outputs[0]).join('');
      const gateSignatures = {
        '0001': 'AND Gate', '0111': 'OR Gate', '0110': 'XOR Gate',
        '1110': 'NAND Gate', '1000': 'NOR Gate', '1001': 'XNOR Gate'
      };
      gateIdentity = gateSignatures[outValues] || "Custom Circuit";
    }

    setTruthTable({ headers: { inputs, outputs }, rows: tableData, identity: gateIdentity });
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex">
      <Sidebar onSave={onSave} onLoad={onLoad} onGenerateTable={generateTruthTable} />
      
      <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
        
        {/* Truth Table Modal */}
        {truthTable && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setTruthTable(null)}
          >
            <div 
              className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-2xl min-w-[300px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-white font-bold">Truth Table</h2>
                <button onClick={() => setTruthTable(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              
              <div className="text-emerald-400 font-mono text-sm mb-4">Result: {truthTable.identity}</div>

              <table className="w-full text-center text-white border-collapse">
                <thead>
                  <tr className="border-b border-slate-600">
                    {truthTable.headers.inputs.map((_, i) => <th key={`in-${i}`} className="p-2 text-blue-300">In {i+1}</th>)}
                    {truthTable.headers.outputs.map((_, i) => <th key={`out-${i}`} className="p-2 text-yellow-300">Out {i+1}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {truthTable.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-700/50">
                      {row.inputs.map((val, iIdx) => <td key={`r-in-${iIdx}`} className="p-2">{val}</td>)}
                      {row.outputs.map((val, oIdx) => <td key={`r-out-${oIdx}`} className="p-2 bg-slate-700/30">{val}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={20} size={2} />
          <Controls className="bg-slate-800 border-none shadow-lg" />
          
          <Panel position="top-right" className="bg-slate-800 px-3 py-1.5 rounded-md shadow-lg border border-slate-700 text-xs font-semibold text-slate-400">
            <a href="https://instagram.com/vams.i_madhav_79" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-2">
              <span>📸</span> @vams.i_madhav_79
            </a>
          </Panel>

        </ReactFlow>
      </div>
    </div>
  );
}