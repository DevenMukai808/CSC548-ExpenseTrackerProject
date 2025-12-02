import React, { useMemo } from 'react';
import { Transaction, Budget } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, AlertCircle, Target } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets }) => {

  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalBalance: income - expenses,
      totalIncome: income,
      totalExpenses: expenses,
      savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const byCategory: Record<string, number> = {};
    expenses.forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categories
  }, [transactions]);

  const spendingTrend = useMemo(() => {
    // Simple last 6 months trend
    const months: Record<string, number> = {};
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(t => {
      if (t.type === 'expense') {
        const d = new Date(t.date);
        const key = `${d.getMonth() + 1}/${d.getFullYear()}`; // Simple key format
        months[key] = (months[key] || 0) + t.amount;
      }
    });
    
    // Take last 6 keys
    const keys = Object.keys(months).slice(-6);
    return keys.map(k => ({ name: k, amount: months[k] }));
  }, [transactions]);

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-gray-500">Track your financial health and spending patterns.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-2">Total Balance</span>
          <div className="flex items-end justify-between mt-auto">
            <span className="text-3xl font-bold text-gray-900">${stats.totalBalance.toLocaleString()}</span>
            <div className={`p-2 rounded-full ${stats.totalBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
               <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-2">Monthly Income</span>
          <div className="flex items-end justify-between mt-auto">
            <span className="text-3xl font-bold text-gray-900">${stats.totalIncome.toLocaleString()}</span>
            <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
               <ArrowUpRight size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-2">Monthly Expenses</span>
          <div className="flex items-end justify-between mt-auto">
            <span className="text-3xl font-bold text-gray-900">${stats.totalExpenses.toLocaleString()}</span>
            <div className="p-2 rounded-full bg-rose-50 text-rose-600">
               <ArrowDownRight size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-2">Savings Rate</span>
          <div className="flex items-end justify-between mt-auto">
            <span className="text-3xl font-bold text-gray-900">{stats.savingsRate.toFixed(1)}%</span>
            <div className="p-2 rounded-full bg-amber-50 text-amber-600">
               <Target size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Spending Trend */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Spending Trend</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingTrend}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Breakdown & Alerts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Expenses by Category</h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="text-lg font-bold text-gray-800 mb-4">Budget Alerts</h3>
             <div className="space-y-3">
               {budgets.map(budget => {
                 const spent = transactions
                    .filter(t => t.type === 'expense' && t.category === budget.category)
                    .reduce((sum, t) => sum + t.amount, 0);
                 const percent = (spent / budget.limit) * 100;
                 
                 if (percent < 80) return null;

                 return (
                   <div key={budget.id} className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg text-sm text-rose-800">
                     <AlertCircle size={16} className="mt-0.5 shrink-0" />
                     <div>
                       <span className="font-semibold">{budget.category}:</span> {percent >= 100 ? 'Budget exceeded!' : 'Nearing limit.'}
                       <div className="text-xs opacity-80 mt-1">${spent} / ${budget.limit}</div>
                     </div>
                   </div>
                 );
               })}
               {budgets.every(b => {
                 const spent = transactions.filter(t => t.type === 'expense' && t.category === b.category).reduce((s, t) => s + t.amount, 0);
                 return (spent / b.limit) * 100 < 80;
               }) && (
                 <p className="text-sm text-gray-500 italic">No active budget alerts. Good job!</p>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;