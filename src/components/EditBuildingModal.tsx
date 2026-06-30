import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { X, Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '../utils/api';

interface Building {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  fillColor: string;
  labelMinZoom: number;
  isLabelVisible: boolean;
  imageUrl?: string;
}

interface Props {
  building: Building;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditBuildingModal: React.FC<Props> = ({ building, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: building.name || '',
    category: building.category || 'BUILDING',
    isActive: building.isActive ?? true,
    imageUrl: building.imageUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await apiFetch(`/buildings/${building.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      onSuccess();
      showToast('Cập nhật tòa nhà thành công', 'success');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật tòa nhà');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/30">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Sửa thông tin tòa nhà</h2>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                Tên tòa nhà
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                Danh mục (Category)
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2371717a\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
              >
                <option value="BUILDING">Tòa nhà chung</option>
                <option value="ACADEMIC">Khu giảng đường</option>
                <option value="PLAZA">Quảng trường / Khu công cộng</option>
                <option value="DORMITORY">Ký túc xá</option>
                <option value="LIBRARY">Thư viện</option>
                <option value="SPORTS_CENTER">Trung tâm thể thao</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                Ảnh đại diện tòa nhà
              </label>
              
              <div className="flex items-center gap-4">
                {formData.imageUrl ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 p-1 rounded-full text-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 shrink-0">
                    <ImageIcon size={28} />
                  </div>
                )}
                
                <div className="flex-1">
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl cursor-pointer transition-colors font-medium border border-zinc-200 dark:border-zinc-700">
                    <Upload size={18} />
                    Tải ảnh lên
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setLoading(true);
                          const url = await uploadFile(file);
                          if (url) setFormData(prev => ({ ...prev, imageUrl: url }));
                        } catch (err: any) {
                          setError(err.message || 'Lỗi upload ảnh');
                        } finally {
                          setLoading(false);
                          e.target.value = ''; // reset input
                        }
                      }} 
                    />
                  </label>
                  <p className="text-xs text-zinc-500 mt-2 text-center">Hoặc có thể dán trực tiếp URL ảnh vào ô bên dưới</p>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="mt-2 w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-zinc-900"
              />
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Hoạt động (Hiển thị trên bản đồ)</span>
            </label>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
