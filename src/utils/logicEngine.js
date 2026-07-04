export const evaluateCircuit = (nodes, edges) => {
  // Create a map for quick node lookup
  const nodeMap = new Map(nodes.map(n => [n.id, { ...n }]));
  const edgeStates = {}; // Keep track of which wires are carrying a '1'

  // Reset all gate inputs first
  nodes.forEach(node => {
    if (node.type === 'gateNode' || node.type === 'outputNode') {
      nodeMap.get(node.id).data = { ...node.data, inputs: {} };
    }
  });

  // Evaluate logic (simplified topological approach for MVP)
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 100) {
    changed = false;
    iterations++;

    edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);

      if (sourceNode && targetNode) {
        const sourceValue = sourceNode.data.value || 0;
        
        // Track edge state for glowing effect
        edgeStates[edge.id] = sourceValue;

        // Pass value to target's specific input handle (e.g., 'a' or 'b')
        const currentInputValue = targetNode.data.inputs[edge.targetHandle];
        
        if (currentInputValue !== sourceValue) {
          targetNode.data.inputs[edge.targetHandle] = sourceValue;
          changed = true;

          // Re-evaluate target node logic
          if (targetNode.type === 'gateNode') {
            const { inputs, gateType } = targetNode.data;
            const valA = inputs['a'] || 0;
            const valB = inputs['b'] || 0;

            if (gateType === 'AND') targetNode.data.value = valA & valB;
            if (gateType === 'OR') targetNode.data.value = valA | valB;
            if (gateType === 'NOT') targetNode.data.value = valA === 0 ? 1 : 0;
            if (gateType === 'NAND') targetNode.data.value = (valA & valB) === 0 ? 1 : 0;
            if (gateType === 'NOR') targetNode.data.value = (valA | valB) === 0 ? 1 : 0;
            if (gateType === 'XOR') targetNode.data.value = valA ^ valB;
            if (gateType === 'XNOR') targetNode.data.value = (valA ^ valB) === 0 ? 1 : 0;
          }
          
          if (targetNode.type === 'outputNode') {
            targetNode.data.value = targetNode.data.inputs['in'] || 0;
          }
        }
      }
    });
  }

  return { updatedNodes: Array.from(nodeMap.values()), edgeStates };
};