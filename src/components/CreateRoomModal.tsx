import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../contexts/ToastContext';
import { X, Loader2, Save, Box } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialBuildingId?: string;
}

export const CreateRoomModal: React.FC<Props> = ({ onClose, onSuccess, initialBuildingId }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    buildingId: initialBuildingId || '',
  });
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/buildings')
      .then(res => {
        setBuildings(res);
        if (!formData.buildingId && res.length > 0) {
          setFormData(prev => ({ ...prev, buildingId: res[0].id }));
        }
      })
      .catch(() => setError('Không thể tải danh sách tòa nhà'))
      .finally(() => setIsFetching(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          buildingId: formData.buildingId,
        }),
      });
      showToast('Tạo phòng thành công', 'success');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo phòng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
              <Box size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Thêm Phòng Mới</h2>
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

          {isFetching ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-pink-500" size={28} />
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Tên phòng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="VD: C1 | 201"
                  className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Tòa nhà <span className="text-red-500">*</span>
                </label>
                <select
                  name="buildingId"
                  value={formData.buildingId}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50 appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2371717a\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                >
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Phòng sẽ được tạo với trạng thái mặc định là "Trống". Bạn có thể chỉnh sửa sức chứa, tầng, loại phòng sau khi tạo.
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
              disabled={loading || isFetching}
              className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-pink-500/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Tạo phòng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
