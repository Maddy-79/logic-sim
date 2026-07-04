import { Handle, Position } from 'reactflow';
import { Lightbulb } from 'lucide-react';

export default function OutputNode({ data }) {
  const isOn = data.value === 1;
  return (
    <div className={`p-4 rounded-full border-4 transition-all duration-300 ${
      isOn 
      ? 'bg-yellow-400/20 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]' 
      : 'bg-slate-800 border-slate-600'
    }`}>
      <Handle type="target" position={Position.Left} id="in" className="w-3 h-3 bg-slate-400" />
      <Lightbulb size={32} className={`${isOn ? 'text-yellow-400' : 'text-slate-500'}`} />
    </div>
  );
}