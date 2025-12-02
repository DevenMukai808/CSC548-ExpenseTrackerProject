import React, { useState, useEffect } from 'react';
import { ViewState, Transaction, Budget, SavingsGoal } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TransactionManager from './components/TransactionManager';
import BudgetPlanner from './components/BudgetPlanner';
import GoalTracker from './components/GoalTracker';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  // Handlers
  const addTransaction = (t: Transaction) => setTransactions(prev => [t, ...prev]);
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));

  const addBudget = (b: Budget) => setBudgets(prev => [...prev, b]);
  const removeBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));

  const addGoal = (g: SavingsGoal) => setGoals(prev => [...prev, g]);
  const removeGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  const updateGoalAmount = (id: string, amount: number) => {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: amount } : g));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard transactions={transactions} budgets={budgets} />;
      case 'transactions':
        return <TransactionManager transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} />;
      case 'budgets':
        return <BudgetPlanner budgets={budgets} transactions={transactions} addBudget={addBudget} removeBudget={removeBudget} />;
      case 'goals':
        return <GoalTracker goals={goals} addGoal={addGoal} removeGoal={removeGoal} updateGoalAmount={updateGoalAmount} />;
      default:
        return <Dashboard transactions={transactions} budgets={budgets} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
           <div className="flex items-center gap-2 text-indigo-600 font-bold">
               <div className="w-6 h-6 bg-indigo-600 rounded text-white flex items-center justify-center text-xs">S</div>
               SmartSpend
           </div>
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
             <Menu size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
