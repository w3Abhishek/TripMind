'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTripExpenses, addExpense, deleteExpense } from '@/lib/firestore';
import { ExpenseDoc } from '@/lib/types';
import { getCategoryIcon, formatCurrency } from '@/lib/utils';
import { Plus, Trash2, X, Send } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['food', 'transport', 'hotel', 'activity', 'other'] as const;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'https://backend-1074735360467.europe-west1.run.app';

interface ExpensesTabProps { tripId: string }

export default function ExpensesTab({ tripId }: ExpensesTabProps) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<(ExpenseDoc & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nlInput, setNlInput] = useState('');
  const [form, setForm] = useState<Partial<ExpenseDoc>>({
    description: '', amount: 0, currency: 'INR', category: 'food', paidBy: user?.displayName ?? 'Me', splitBetween: [],
  });

  const loadExpenses = useCallback(() => {
    getTripExpenses(tripId).then(setExpenses).catch(console.error).finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const parseNL = async () => {
    if (!nlInput.trim()) return;
    try {
      const res = await fetch(`${BACKEND_URL}/expenses/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nlInput }),
      });
      const data = await res.json();
      if (!data.error) {
        setForm({ ...form, ...data, paidBy: user?.displayName ?? 'Me' });
        setNlInput('');
        toast.success('Expense parsed! Review and save.');
      }
    } catch { toast.error('Could not parse expense'); }
  };

  const handleSave = async () => {
    if (!form.description || !form.amount) { toast.error('Fill in description and amount.'); return; }
    try {
      await addExpense({
        tripId,
        description: form.description!,
        amount: Number(form.amount),
        currency: form.currency ?? 'INR',
        category: form.category as ExpenseDoc['category'] ?? 'other',
        paidBy: form.paidBy ?? user?.displayName ?? 'Me',
        splitBetween: form.splitBetween ?? [],
        addedBy: user?.uid ?? '',
      });
      toast.success('Expense added!');
      setShowModal(false);
      setForm({ description: '', amount: 0, currency: 'INR', category: 'food', paidBy: user?.displayName ?? 'Me', splitBetween: [] });
      loadExpenses();
    } catch { toast.error('Failed to add expense'); }
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast.success('Expense deleted');
  };

  const totalByCat = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {} as Record<string, number>);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const perPerson = expenses.length > 0 ? total / (expenses[0].splitBetween?.length || 1) : 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Summary card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Expense Summary</h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(total)}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(perPerson)}</p>
              <p className="text-xs text-muted-foreground">Per Person (est.)</p>
            </div>
          </div>

          {/* Category bars */}
          {CATEGORIES.filter(c => totalByCat[c] > 0).map(cat => (
            <div key={cat} className="flex items-center gap-3 mb-2">
              <span className="text-base w-6">{getCategoryIcon(cat)}</span>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-foreground capitalize">{cat}</span>
                  <span className="text-muted-foreground">{formatCurrency(totalByCat[cat])}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full">
                  <div className="budget-bar h-full" style={{ width: `${total > 0 ? (totalByCat[cat] / total) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expense list */}
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">All Expenses</h3>
          {loading && [1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-lg" />)}
          {!loading && expenses.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">No expenses yet. Add your first one!</div>
          )}
          {expenses.map(exp => (
            <div key={exp.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card hover:shadow-sm transition-all">
              <span className="text-xl">{getCategoryIcon(exp.category)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{exp.description}</p>
                <p className="text-xs text-muted-foreground">Paid by {exp.paidBy}</p>
              </div>
              <span className="font-semibold text-foreground text-sm">{formatCurrency(exp.amount, exp.currency)}</span>
              <button onClick={() => handleDelete(exp.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add expense modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl p-6 space-y-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Add Expense</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>

            {/* NL parse */}
            <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <input
                type="text"
                value={nlInput}
                onChange={e => setNlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && parseNL()}
                placeholder='e.g. "₹850 dinner with Priya"'
                className="flex-1 bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button onClick={parseNL} className="p-1.5 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground -mt-2 text-center">Or describe in natural language and let AI parse it</p>

            {/* Manual form */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <input type="text" value={form.description ?? ''} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="Dinner at Trishna" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount</label>
                <input type="number" value={form.amount ?? ''} onChange={e => setForm({...form, amount: Number(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="850" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Currency</label>
                <select value={form.currency ?? 'INR'} onChange={e => setForm({...form, currency: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30">
                  {['INR','USD','EUR','GBP','JPY','AED'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setForm({...form, category: cat})}
                      className={`pill-btn text-xs ${form.category === cat ? 'bg-primary text-primary-foreground border-primary' : ''}`}>
                      {getCategoryIcon(cat)} {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Paid by</label>
                <input type="text" value={form.paidBy ?? ''} onChange={e => setForm({...form, paidBy: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" placeholder="You" />
              </div>
            </div>

            <button onClick={handleSave} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all">
              Save Expense
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
