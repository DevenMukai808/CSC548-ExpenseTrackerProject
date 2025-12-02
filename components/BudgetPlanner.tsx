import React, { useState } from 'react';
import { Budget, Transaction } from '../types';
import { Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BudgetPlannerProps {
  budgets: Budget[];
  transactions: Transaction[];
  addBudget: (b: Budget) => void;
  removeBudget: (id: string) => void;
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ budgets, transactions, addBudget, removeBudget }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const handleAdd = () => {
    if (newCategory && newLimit) {
      addBudget({
        id: crypto.randomUUID(),
        category: newCategory,
        limit: parseFloat(newLimit)
      });
      setNewCategory('');
      setNewLimit('');
      setIsAdding(false);
    }
  };

  const getSpentAmount = (category: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && 
               t.category.toLowerCase() === category.toLowerCase() &&
               d.getMonth() === currentMonth &&
               d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Monthly Budgets</h1>
           <p className="text-gray-500">Set limits for your spending categories</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          <Plus size={20} />
          Create Budget
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold text-gray-800 mb-4">New Budget Category</h3>
          <div className="flex gap-4 flex-wrap">
            <input 
              className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Category Name (e.g. Food)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <input 
              className="w-32 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Limit ($)"
              type="number"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
            />
            <button 
              onClick={handleAdd}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
            >
              Save
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="px-6 py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(budget => {
          const spent = getSpentAmount(budget.category);
          const percentage = Math.min((spent / budget.limit) * 100, 100);
          const isOver = spent > budget.limit;
          
          return (
            <div key={budget.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group overflow-hidden">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <h3 className="font-bold text-lg text-gray-900">{budget.category}</h3>
                   <span className="text-sm text-gray-400">Monthly Limit: ${budget.limit.toLocaleString()}</span>
                 </div>
                 <button 
                    onClick={() => removeBudget(budget.id)}
                    className="text-gray-300 hover:text-rose-500 transition-colors"
                 >
                    <Trash2 size={18} />
                 </button>
               </div>

               <div className="mb-2 flex justify-between items-end">
                 <span className={`text-2xl font-bold ${isOver ? 'text-rose-600' : 'text-gray-900'}`}>
                    ${spent.toLocaleString()}
                 </span>
                 {isOver ? (
                     <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                         <AlertTriangle size={12} /> Over Budget
                     </span>
                 ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <CheckCircle2 size={12} /> On Track
                    </span>
                 )}
               </div>

               <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : percentage > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
               </div>
               <div className="mt-2 text-xs text-gray-400 text-right">
                  {percentage.toFixed(0)}% used
               </div>
            </div>
          );
        })}

        {budgets.length === 0 && !isAdding && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                <p>No budgets set. Create one to start tracking!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPlanner;
