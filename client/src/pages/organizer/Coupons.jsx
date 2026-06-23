import { useState, useEffect } from 'react';
import api from '../../services/axios';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

export default function OrgCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discountType: 'percent', discountValue: 10, maxUses: 100, expiryDate: '' });

  useEffect(() => {
    api.get('/coupons').then((res) => setCoupons(res.data.data)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/coupons', form);
      setCoupons([res.data.data, ...coupons]);
      setShowForm(false);
      setForm({ code: '', discountType: 'percent', discountValue: 10, maxUses: 100, expiryDate: '' });
      toast.success('Coupon created');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Coupons</h1>
        <button onClick={() => setShowForm(!showForm)} className="gradient-btn px-4 py-2 rounded-xl text-sm font-medium">
          {showForm ? 'Cancel' : 'Create Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass rounded-2xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Code</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="SUMMER20" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Type</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Value</label>
              <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Expiry Date</label>
            <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium">Create Coupon</button>
        </form>
      )}

      <div className="space-y-2">
        {coupons.map((c) => (
          <div key={c._id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{c.code}</p>
              <p className="text-xs text-gray-500">{c.discountType === 'percent' ? `${c.discountValue}% off` : `$${c.discountValue} off`} • Used {c.usedCount}/{c.maxUses || '∞'} • Expires {formatDate(c.expiryDate)}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
