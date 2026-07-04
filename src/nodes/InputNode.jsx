import { Handle, Position } from 'reactflow';

export default function InputNode({ data }) {
  return (
    <div className="bg-slate-800 border-2 border-slate-600 rounded-lg p-3 text-white shadow-xl min-w-[100px] text-center">
      <div className="text-xs font-bold text-slate-400 mb-2">INPUT</div>
      <button 
        onClick={data.toggleValue}
        className={`w-full py-2 rounded font-bold transition-all ${
          data.value === 1 
            ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' 
            : 'bg-slate-700 hover:bg-slate-600'
        }`}
      >
        {data.value === 1 ? '1 (ON)' : '0 (OFF)'}
      </button>
      <Handle type="source" position={Position.Right} id="out" className="w-3 h-3 bg-blue-400" />
    </div>
  );
}