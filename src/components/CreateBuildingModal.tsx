import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { X, Loader2, Save, Upload, Image as ImageIcon, Building2 } from 'lucide-react';
import { uploadFile } from '../utils/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateBuildingModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: 'BUILDING',
    isActive: true,
    imageUrl: '',
    mapId: '',
  });
  const [maps, setMaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetchingMaps, setIsFetchingMaps] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/maps')
      .then(res => {
        setMaps(res);
        if (res.length > 0) setFormData(prev => ({ ...prev, mapId: res[0].id }));
      })
      .catch(() => setError('Không thể tải danh sách bản đồ'))
      .finally(() => setIsFetchingMaps(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const baseLat = 21.0048;
      const baseLng = 105.8456;
      const offset = 0.0005;
      const points = [
        [baseLng - offset, baseLat - offset],
        [baseLng + offset, baseLat - offset],
        [baseLng + offset, baseLat + offset],
        [baseLng - offset, baseLat + offset],
        [baseLng - offset, baseLat - offset],
      ];

      const createdBuilding = await apiFetch('/buildings', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          mapId: formData.mapId,
          points,
        }),
      });

      if (createdBuilding?.id && (formData.category !== 'BUILDING' || formData.imageUrl)) {
        await apiFetch(`/buildings/${createdBuilding.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            isActive: formData.isActive,
            imageUrl: formData.imageUrl,
          }),
        });
      }

      showToast('Tạo tòa nhà thành công', 'success');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo tòa nhà');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Building2 size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Thêm Tòa nhà Mới</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          {isFetchingMaps ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-emerald-500" size={28} />
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Tên tòa nhà <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="VD: Tòa C8"
                  className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Bản đồ <span className="text-red-500">*</span>
                </label>
                <select
                  name="mapId"
                  value={formData.mapId}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2371717a\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                >
                  {maps.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
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
                <p className="text-xs text-zinc-500 mt-1.5">Danh mục sẽ được áp dụng sau khi tạo (qua chức năng sửa).</p>
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
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      placeholder="Hoặc dán URL ảnh..."
                      className="mt-2 w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-1.5">Ảnh sẽ được áp dụng sau khi tạo (qua chức năng sửa).</p>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Tòa nhà sẽ được tạo với tọa độ mặc định tại trung tâm campus. Bạn có thể chỉnh sửa chi tiết (vị trí, danh mục, ảnh) sau khi tạo.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || isFetchingMaps}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Tạo tòa nhà
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
