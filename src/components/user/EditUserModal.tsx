import React, { useState } from 'react';
import { X, Trash2, Save, Loader2, User as UserIcon, Upload, Camera } from 'lucide-react';
import { apiFetch, uploadFile } from '../../utils/api';

interface EditUserModalProps {
  user: any | null; // null means Create new user
  onClose: () => void;
  onSuccess: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSuccess }) => {
  const isEditing = !!user;
  const [formData, setFormData] = useState({
    phonenumber: user?.phonenumber || '',
    fullName: user?.fullName || '',
    username: user?.username || '',
    role: user?.role || 'USER',
    avatar: user?.avatar || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const url = await uploadFile(file);
      if (url) setFormData(prev => ({ ...prev, avatar: url }));
    } catch (err: any) {
      setError(err.message || 'Lỗi tải ảnh lên');
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isEditing) {
        await apiFetch(`/users/${user.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch(`/users`, {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            password: 'User@123', // Default password for newly created users
          }),
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Thao tác không thể phục hồi!')) {
      return;
    }
    
    setIsDeleting(true);
    setError('');
    
    try {
      await apiFetch(`/users/${user.id}`, {
        method: 'DELETE',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa người dùng');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{isEditing ? 'Sửa Người Dùng' : 'Thêm Người Dùng Mới'}</h2>
              {isEditing && <p className="text-sm text-zinc-500 mt-0.5 font-mono">ID: {user.id.substring(0, 8)}...</p>}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium flex items-start gap-3">
              <span className="mt-0.5 text-lg">⚠️</span>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-6">
            {/* Avatar Upload */}
            <div className="flex justify-center mb-2">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={40} className="text-zinc-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg transition-transform hover:scale-110 border-2 border-white dark:border-zinc-800">
                  <Camera size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Số điện thoại *</label>
                <input
                  type="text"
                  name="phonenumber"
                  value={formData.phonenumber}
                  onChange={handleChange}
                  placeholder="09..."
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-zinc-400"
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="john_doe"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-zinc-400"
                  required
                />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-zinc-400"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Vai trò (Role)</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2371717a\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                >
                  <option value="USER">Nguời dùng (USER)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>
            </div>
            {!isEditing && (
              <p className="text-xs text-zinc-500 text-center mt-2">Mật khẩu mặc định sẽ được đặt là <strong className="text-blue-500">User@123</strong></p>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 flex items-center justify-between">
          {isEditing ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-white border border-red-200 dark:border-red-500/30 hover:bg-red-500 hover:border-red-500 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Xóa user
            </button>
          ) : <div></div>}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isDeleting}
              className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || isDeleting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEditing ? 'Lưu thay đổi' : 'Tạo mới'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
