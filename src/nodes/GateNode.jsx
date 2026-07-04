import { Handle, Position } from 'reactflow';

export default function GateNode({ data }) {
  const isNot = data.gateType === 'NOT';

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-500 rounded-lg p-4 flex items-center justify-center min-w-[100px] shadow-lg">
      {/* If it's a NOT gate, center the single handle. Otherwise, show A and B */}
      <Handle type="target" position={Position.Left} id="a" style={{ top: isNot ? '50%' : '25%' }} className="w-3 h-3 bg-slate-400" />
      {!isNot && (
        <Handle type="target" position={Position.Left} id="b" style={{ top: '75%' }} className="w-3 h-3 bg-slate-400" />
      )}
      
      <div className="font-mono text-xl font-bold tracking-widest text-slate-200">
        {data.gateType}
      </div>

      <Handle type="source" position={Position.Right} id="out" className="w-3 h-3 bg-blue-400" />
    </div>
  );
}