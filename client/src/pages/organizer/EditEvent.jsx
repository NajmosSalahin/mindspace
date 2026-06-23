import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/axios';
import { CATEGORIES, CITIES } from '../../constants';
import toast from 'react-hot-toast';

const emptyTicket = { name: '', price: 0, quantity: 100, description: '' };

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Tech', venue: '', address: '', city: '', country: 'United States',
    date: '', startTime: '09:00', endTime: '17:00', capacity: 200,
    ticketTypes: [{ ...emptyTicket }], tags: '',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    api.get(`/events/${id}`).then((res) => {
      const e = res.data.data;
      setForm({
        title: e.title || '',
        description: e.description || '',
        category: e.category || 'Tech',
        venue: e.venue || '',
        address: e.address || '',
        city: e.city || '',
        country: e.country || 'United States',
        date: e.date ? e.date.split('T')[0] : '',
        startTime: e.startTime || '09:00',
        endTime: e.endTime || '17:00',
        capacity: e.capacity || 200,
        ticketTypes: e.ticketTypes?.length > 0
          ? e.ticketTypes.map((tt) => ({ name: tt.name, price: tt.price, quantity: tt.remaining || tt.quantity || 100, description: tt.description || '' }))
          : [{ ...emptyTicket }],
        tags: e.tags?.join(', ') || '',
      });
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load event');
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.patch(`/events/${id}`, {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        ticketTypes: form.ticketTypes.map((tt) => ({ ...tt, price: parseFloat(tt.price), quantity: parseInt(tt.quantity) })),
        capacity: parseInt(form.capacity),
      });
      toast.success('Event updated!');
      navigate('/organizer/events');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-6" />
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="h-4 w-1/4 bg-white/10 rounded animate-pulse" />
          <div className="h-10 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-20 w-full bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-6">Edit Event</h1>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1 rounded-full ${s <= step ? 'bg-indigo-500' : 'bg-white/10'}`} />
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Basic Info</h2>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Title</label>
              <input value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Category</label>
                <select value={form.category} onChange={(e) => update('category', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                  {CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tags</label>
                <input value={form.tags} onChange={(e) => update('tags', e.target.value)} placeholder="tech, conference" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Date, Time & Venue</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Capacity</label>
                <input type="number" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Start Time</label>
                <input type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">End Time</label>
                <input type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Venue</label>
              <input value={form.venue} onChange={(e) => update('venue', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Address</label>
                <input value={form.address} onChange={(e) => update('address', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">City</label>
                <select value={form.city} onChange={(e) => update('city', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Country</label>
                <input value={form.country} onChange={(e) => update('country', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Ticket Types</h2>
            {form.ticketTypes.map((tt, i) => (
              <div key={i} className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Ticket #{i + 1}</span>
                  {form.ticketTypes.length > 1 && (
                    <button onClick={() => setForm({ ...form, ticketTypes: form.ticketTypes.filter((_, idx) => idx !== i) })} className="text-xs text-red-400">Remove</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Name</label>
                    <input value={tt.name} onChange={(e) => {
                      const tts = [...form.ticketTypes];
                      tts[i].name = e.target.value;
                      setForm({ ...form, ticketTypes: tts });
                    }} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="General" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Price ($)</label>
                    <input type="number" value={tt.price} onChange={(e) => {
                      const tts = [...form.ticketTypes];
                      tts[i].price = parseFloat(e.target.value);
                      setForm({ ...form, ticketTypes: tts });
                    }} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                  <input type="number" value={tt.quantity} onChange={(e) => {
                    const tts = [...form.ticketTypes];
                    tts[i].quantity = parseInt(e.target.value);
                    setForm({ ...form, ticketTypes: tts });
                  }} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
            ))}
            <button
              onClick={() => setForm({ ...form, ticketTypes: [...form.ticketTypes, { ...emptyTicket }] })}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              + Add Ticket Type
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button onClick={() => setStep(Math.max(1, step - 1))} className={`text-sm text-gray-400 hover:text-white ${step === 1 ? 'invisible' : ''}`}>Back</button>
          <span className="text-xs text-gray-500">Step {step} of 3</span>
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="gradient-btn px-6 py-2 rounded-xl text-sm font-medium">Next</button>
          ) : (
            <button onClick={handleSubmit} disabled={saving} className="gradient-btn px-6 py-2 rounded-xl text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
