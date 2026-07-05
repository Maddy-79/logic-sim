// src/components/Sidebar.jsx
import React from 'react';
import GateSymbol from './GateSymbol';
import { ToggleLeft, Lightbulb } from 'lucide-react';

export default function Sidebar({ onSave, onLoad, onGenerateTable }) {
  const onDragStart = (event, nodeType, gateType = '') => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/gateType', gateType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const gateTypes = [
    { type: 'AND', label: 'AND Gate', color: 'text-purple-400' },
    { type: 'OR', label: 'OR Gate', color: 'text-emerald-400' },
    { type: 'NOT', label: 'NOT Gate', color: 'text-red-400' },
    { type: 'NAND', label: 'NAND Gate', color: 'text-pink-400' },
    { type: 'NOR', label: 'NOR Gate', color: 'text-teal-400' },
    { type: 'XOR', label: 'XOR Gate', color: 'text-orange-400' },
  ];

  return (
    <aside className="w-64 bg-slate-800/90 backdrop-blur-md border-r border-slate-700 p-4 flex flex-col gap-4 text-white z-10 shadow-2xl h-screen">
      <div className="font-bold text-sm tracking-wider text-slate-400 uppercase border-b border-slate-700 pb-2">
        Components
      </div>
      
      <div 
        className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600 rounded-lg cursor-grab hover:bg-slate-600/50 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, 'inputNode')}
      >
        <ToggleLeft className="text-blue-400" />
        <span>Input Switch</span>
      </div>

      {gateTypes.map((gate) => (
        <div
          key={gate.type}
          className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600 rounded-lg cursor-grab hover:bg-slate-600/50 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, 'gateNode', gate.type)}
        >
          <div className={`w-8 h-8 ${gate.color}`}>
            <GateSymbol type={gate.type} colorClass={gate.color} />
          </div>
          <span>{gate.label}</span>
        </div>
      ))}

      <div 
        className="flex items-center gap-3 p-3 bg-slate-700/50 border border-slate-600 rounded-lg cursor-grab hover:bg-slate-600/50 transition-colors"
        draggable
        onDragStart={(e) => onDragStart(e, 'outputNode')}
      >
        <Lightbulb className="text-yellow-400" />
        <span>Output Bulb</span>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-700 flex flex-col gap-2">
        <button onClick={onGenerateTable} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow transition-colors text-sm">
          🧮 Generate Truth Table
        </button>
        <div className="flex gap-2">
          <button onClick={onSave} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded shadow transition-colors text-xs">💾 Save</button>
          <label className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded shadow transition-colors text-xs text-center cursor-pointer">
            📁 Load<input type="file" accept=".json" className="hidden" onChange={onLoad} />
          </label>
        </div>
      </div>
    </aside>
  );
}