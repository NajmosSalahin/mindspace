import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useUpdateProfileMutation, useChangePasswordMutation } from '../../redux/services/authService';
import { updateUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [changePassword] = useChangePasswordMutation();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', phone: user?.phone || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(form).unwrap();
      dispatch(updateUser(res.data));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    try {
      await changePassword(passForm).unwrap();
      toast.success('Password changed');
      setPassForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold mb-6">Profile Settings</h1>
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 flex items-center justify-center text-xl">
            {user?.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full rounded-full object-cover" /> : user?.name?.[0]}
          </div>
          <div>
            <h3 className="font-semibold">{user?.name}</h3>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <span className="text-xs text-indigo-400 capitalize">{user?.role}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" rows={3} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <button type="submit" disabled={isLoading} className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Change Password</h3>
        <form onSubmit={handlePassword} className="space-y-4">
          <input type="password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} placeholder="Current password" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          <input type="password" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} placeholder="New password (min 6 chars)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          <button type="submit" className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium">Change Password</button>
        </form>
      </div>
    </div>
  );
}
