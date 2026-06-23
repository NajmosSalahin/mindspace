import { useState, useEffect } from 'react';
import api from '../../services/axios';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', description: '', color: '#4F46E5' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get('/admin/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/categories', form);
      setCategories([...categories, res.data.data]);
      setForm({ name: '', slug: '', icon: '', description: '', color: '#4F46E5' });
      setShowForm(false);
      toast.success('Category created');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold">Categories</h1>
        <button onClick={() => setShowForm(!showForm)} className="gradient-btn px-4 py-2 rounded-xl text-sm font-medium">
          {showForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass rounded-2xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Slug</label>
              <input value={form.slug} readOnly className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Color</label>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer bg-white/5" />
          </div>
          <button type="submit" className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium">Create</button>
        </form>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat._id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: cat.color }} />
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-gray-500">/{cat.slug}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${cat.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {cat.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
