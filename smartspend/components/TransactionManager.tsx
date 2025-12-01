import React, { useState, useRef } from 'react';
import { Transaction, TransactionType } from '../types';
import { Search, Plus, Upload, Filter, Trash2, Camera, Loader2 } from 'lucide-react';
import { parseReceiptImage, suggestCategory } from '../services/geminiService';

interface TransactionManagerProps {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ transactions, addTransaction, deleteTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [description, setDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setMerchant('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setType(TransactionType.EXPENSE);
    setDescription('');
  };

  const handleSave = () => {
    if (!merchant || !amount) return;
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date,
      merchant,
      amount: parseFloat(amount),
      category: category || 'Uncategorized',
      type,
      description
    };
    addTransaction(newTransaction);
    setIsModalOpen(false);
    resetForm();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        // Strip prefix data:image/jpeg;base64,
        const base64Data = base64.split(',')[1];
        
        const data = await parseReceiptImage(base64Data);
        if (data.merchant) setMerchant(data.merchant);
        if (data.amount) setAmount(data.amount.toString());
        if (data.date) setDate(data.date);
        if (data.category) setCategory(data.category);
        if (data.description) setDescription(data.description);
        
        setIsModalOpen(true); // Open modal with data
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Failed to parse receipt.');
    } finally {
      setLoading(false);
      // clear input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSuggestCategory = async () => {
      if (!merchant) return;
      const cat = await suggestCategory(merchant, description);
      setCategory(cat);
  };

  const filteredTransactions = transactions.filter(t => 
    t.merchant.toLowerCase().includes(filter.toLowerCase()) ||
    t.category.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
           <p className="text-gray-500">Manage your income and expenses</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
           >
             {loading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
             <span className="hidden sm:inline">Scan Receipt</span>
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*" 
             capture="environment"
             onChange={handleFileUpload} 
           />
           <button 
             onClick={() => { resetForm(); setIsModalOpen(true); }}
             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
           >
             <Plus size={20} />
             Add Manual
           </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-6 bg-white p-2 rounded-xl border border-gray-100 shadow-sm w-full max-w-md">
        <Search size={20} className="text-gray-400 ml-2" />
        <input 
          type="text" 
          placeholder="Search merchant or category..." 
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Filter size={16} className="text-gray-400 mr-2" />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                  <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                          No transactions found. Add one to get started!
                      </td>
                  </tr>
              ) : (
                filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{t.date}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                        {t.merchant}
                        {t.description && <div className="text-xs text-gray-400 font-normal truncate max-w-[150px]">{t.description}</div>}
                    </td>
                    <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {t.category}
                        </span>
                    </td>
                    <td className={`p-4 text-sm font-bold text-right ${t.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {t.type === 'income' ? '+' : ''}${t.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                        <button 
                        onClick={() => deleteTransaction(t.id)}
                        className="text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                        <Trash2 size={18} />
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as TransactionType)}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value={TransactionType.EXPENSE}>Expense</option>
                    <option value={TransactionType.INCOME}>Income</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Amount</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Merchant</label>
                <input 
                  type="text" 
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Starbucks"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

               <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase flex justify-between">
                    Category
                    <button onClick={handleSuggestCategory} className="text-indigo-600 text-[10px] hover:underline">
                        Auto-Suggest
                    </button>
                </label>
                <input 
                  type="text" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Food"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;
