import React from 'react';
import { Handle, Position } from 'reactflow';
import GateSymbol from '../components/GateSymbol';

export default function GateNode({ data }) {
  const isNot = data.gateType === 'NOT';
  
  // Dynamic color based on gate type
  const colorMap = {
    AND: 'text-purple-400',
    OR: 'text-emerald-400',
    NOT: 'text-red-400',
    NAND: 'text-pink-400',
    NOR: 'text-teal-400',
    XOR: 'text-orange-400'
  };

  const colorClass = colorMap[data.gateType] || 'text-white';

  return (
    // src/nodes/GateNode.jsx
// ... inside your return statement
<div className="bg-slate-800/90 backdrop-blur-md border border-slate-600 rounded-xl p-2 flex flex-row items-center gap-2 shadow-xl">
  <div className="flex flex-col gap-4">
     <Handle type="target" position={Position.Left} id="a" style={{ top: isNot ? '50%' : '30%' }} className="!bg-slate-400 !w-3 !h-3" />
     {!isNot && <Handle type="target" position={Position.Left} id="b" style={{ top: '70%' }} className="!bg-slate-400 !w-3 !h-3" />}
  </div>
  
  {/* Force a fixed size here */}
  <div className="w-16 h-12 flex items-center justify-center">
    <GateSymbol type={data.gateType} colorClass={colorClass} />
  </div>

  <Handle type="source" position={Position.Right} id="out" className="!bg-blue-400 !w-3 !h-3" />
</div>
  );
}