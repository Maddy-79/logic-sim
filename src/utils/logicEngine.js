export const evaluateCircuit = (nodes, edges) => {
  const nodeValues = {};
  const edgeStates = {};
  
  // 1. Initialize input nodes from their data values
  nodes.forEach(node => {
    if (node.type === 'inputNode') {
      nodeValues[node.id] = node.data.value || 0;
    }
  });

  // 2. Multi-pass evaluation (ensures signals propagate through chains)
  // We run this enough times to ensure signals reach the end of any chain
  for (let pass = 0; pass < nodes.length; pass++) {
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (sourceNode && nodeValues[sourceNode.id] !== undefined) {
        edgeStates[edge.id] = nodeValues[sourceNode.id];
      }
    });

    nodes.forEach(node => {
      if (node.type === 'gateNode') {
        // Find all incoming edges to this gate
        const incomingEdges = edges.filter(e => e.target === node.id);
        const inputValues = incomingEdges.map(e => edgeStates[e.id] || 0);

        // Perform logic based on gate type
        let result = 0;
        const [a, b] = inputValues; // Handles up to 2 inputs

        switch (node.data.gateType) {
          case 'AND': result = (a && b) ? 1 : 0; break;
          case 'OR':  result = (a || b) ? 1 : 0; break;
          case 'NOT': result = (a === 0) ? 1 : 0; break;
          case 'NAND': result = (!(a && b)) ? 1 : 0; break;
          case 'NOR':  result = (!(a || b)) ? 1 : 0; break;
          case 'XOR':  result = (a !== b) ? 1 : 0; break;
          default: result = 0;
        }
        nodeValues[node.id] = result;
      }
      
      if (node.type === 'outputNode') {
        const incomingEdge = edges.find(e => e.target === node.id);
        nodeValues[node.id] = incomingEdge ? (edgeStates[incomingEdge.id] || 0) : 0;
      }
    });
  }

  // Map values back to nodes for the UI
  const updatedNodes = nodes.map(n => ({
    ...n,
    data: { ...n.data, value: nodeValues[n.id] ?? 0 }
  }));

  return { updatedNodes, edgeStates };
};  