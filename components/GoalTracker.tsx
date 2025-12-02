import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { Plus, Trash2, Trophy } from 'lucide-react';

interface GoalTrackerProps {
  goals: SavingsGoal[];
  addGoal: (g: SavingsGoal) => void;
  removeGoal: (id: string) => void;
  updateGoalAmount: (id: string, amount: number) => void;
}

const COLORS = ['bg-indigo-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];

const GoalTracker: React.FC<GoalTrackerProps> = ({ goals, addGoal, removeGoal, updateGoalAmount }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = () => {
    if (name && target) {
      addGoal({
        id: crypto.randomUUID(),
        name,
        targetAmount: parseFloat(target),
        currentAmount: 0,
        deadline,
        color: COLORS[goals.length % COLORS.length]
      });
      setName('');
      setTarget('');
      setDeadline('');
      setIsAdding(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
           <p className="text-gray-500">Plan for your future purchases</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus size={20} />
          New Goal
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold text-gray-800 mb-4">Create Savings Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Goal Name (e.g. New Car)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input 
              className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Target Amount ($)"
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
             <input 
              className="p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <div className="flex gap-2">
                <button 
                onClick={handleAdd}
                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
                >
                Save
                </button>
                <button 
                onClick={() => setIsAdding(false)}
                className="px-4 py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl"
                >
                Cancel
                </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map(goal => {
          const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          
          return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full relative overflow-hidden">
               {/* Background Decorative Element */}
               <div className={`absolute top-0 right-0 w-32 h-32 ${goal.color.replace('bg-', 'bg-opacity-10 bg-')} rounded-bl-full -mr-8 -mt-8 z-0`}></div>

               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${goal.color} bg-opacity-10 text-gray-800`}>
                            <Trophy size={24} className={goal.color.replace('bg-', 'text-')} />
                        </div>
                        <button onClick={() => removeGoal(goal.id)} className="text-gray-300 hover:text-rose-500">
                            <Trash2 size={18} />
                        </button>
                   </div>

                   <h3 className="text-xl font-bold text-gray-900 mb-1">{goal.name}</h3>
                   {goal.deadline && <p className="text-xs text-gray-400 mb-4">Target: {new Date(goal.deadline).toLocaleDateString()}</p>}

                   <div className="mt-auto pt-4 space-y-4">
                       <div className="flex justify-between items-end">
                            <span className="text-2xl font-bold text-gray-900">${goal.currentAmount.toLocaleString()}</span>
                            <span className="text-sm font-medium text-gray-400">of ${goal.targetAmount.toLocaleString()}</span>
                       </div>

                       <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ${goal.color}`}
                                style={{ width: `${percent}%` }}
                            />
                       </div>

                       <div className="flex gap-2 pt-2">
                           <button 
                            onClick={() => {
                                const add = prompt("Amount to add?");
                                if (add) updateGoalAmount(goal.id, goal.currentAmount + parseFloat(add));
                            }}
                            className="flex-1 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                           >
                               + Add Funds
                           </button>
                            <button 
                            onClick={() => {
                                const sub = prompt("Amount to withdraw?");
                                if (sub) updateGoalAmount(goal.id, Math.max(0, goal.currentAmount - parseFloat(sub)));
                            }}
                            className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                           >
                               - Withdraw
                           </button>
                       </div>
                   </div>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalTracker;
