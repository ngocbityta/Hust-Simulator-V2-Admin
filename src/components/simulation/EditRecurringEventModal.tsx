import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, BookOpen, Clock, MapPin, Building } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface EditRecurringEventModalProps {
  recurringEvent: any | null; // null means Create
  onClose: () => void;
  onSuccess: () => void;
}

export const EditRecurringEventModal: React.FC<EditRecurringEventModalProps> = ({ recurringEvent, onClose, onSuccess }) => {
  const isEditing = !!recurringEvent;
  
  const [formData, setFormData] = useState({
    name: recurringEvent?.name || '',
    description: recurringEvent?.description || '',
    mapId: recurringEvent?.mapId || '',
    roomId: recurringEvent?.roomId || '',
    cronExpression: recurringEvent?.cronExpression || '0 0 8 * * ?',
    durationMinutes: recurringEvent?.durationMinutes || 90,
    status: recurringEvent?.status || 'ACTIVE',
  });

  const [maps, setMaps] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState('');

  // Fetch initial maps and buildings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mapsRes, buildingsRes] = await Promise.all([
          apiFetch('/maps'),
          apiFetch('/buildings')
        ]);
        setMaps(mapsRes);
        setBuildings(buildingsRes);
        
        // Auto-select map if empty
        if (!isEditing && !formData.mapId && mapsRes.length > 0) {
          setFormData(prev => ({ ...prev, mapId: mapsRes[0].id }));
        }

        // If editing and has roomId, we need to fetch the room to know its building
        if (isEditing && recurringEvent.roomId) {
          const roomRes = await apiFetch(`/rooms/${recurringEvent.roomId}`);
          if (roomRes && roomRes.buildingId) {
            setSelectedBuildingId(roomRes.buildingId);
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial data', err);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchData();
  }, [isEditing, formData.mapId, recurringEvent?.roomId]);

  // Fetch rooms when building changes
  useEffect(() => {
    if (selectedBuildingId) {
      apiFetch(`/rooms/building/${selectedBuildingId}`)
        .then(res => setRooms(res))
        .catch(console.error);
    } else {
      setRooms([]);
    }
  }, [selectedBuildingId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description,
        mapId: formData.mapId,
        cronExpression: formData.cronExpression,
        durationMinutes: formData.durationMinutes,
      };

      if (formData.roomId) {
        payload.roomId = formData.roomId;
      }

      if (isEditing) {
        payload.status = formData.status;
        await apiFetch(`/recurring-events/${recurringEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/recurring-events`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu lớp học/sự kiện lặp');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{isEditing ? 'Sửa Lớp Học' : 'Thêm Lớp Học Mới'}</h2>
              {isEditing && <p className="text-sm text-zinc-500 mt-0.5 font-mono">ID: {recurringEvent.id.substring(0, 8)}...</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium flex items-start gap-3">
              <span className="mt-0.5 text-lg">⚠️</span>
              {error}
            </div>
          )}

          {isFetchingData ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Tên lớp học / môn học *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: Nhập môn AI - IT4244"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mô tả ngắn gọn về lớp học..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-2"><Clock size={16}/> Lịch lặp lại (Cron) *</label>
                  <input
                    type="text"
                    name="cronExpression"
                    value={formData.cronExpression}
                    onChange={handleChange}
                    placeholder="0 0 8 * * ?"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-zinc-500 mt-1">VD: 0 0 8 * * ? (8h sáng mỗi ngày)</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Thời lượng (phút) *</label>
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    min={1}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-2"><Building size={16}/> Tòa nhà</label>
                  <select
                    value={selectedBuildingId}
                    onChange={(e) => {
                      setSelectedBuildingId(e.target.value);
                      setFormData(prev => ({ ...prev, roomId: '' })); // Reset room when building changes
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                  >
                    <option value="">Chọn tòa nhà...</option>
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-2"><MapPin size={16}/> Phòng học</label>
                  <select
                    name="roomId"
                    value={formData.roomId}
                    onChange={handleChange}
                    disabled={!selectedBuildingId}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none disabled:opacity-50"
                  >
                    <option value="">Chọn phòng...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (Tầng {r.floorNum})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Bản đồ (Map)</label>
                  <select
                    name="mapId"
                    value={formData.mapId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                  >
                    <option value="">Chọn bản đồ...</option>
                    {maps.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                {isEditing && (
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Trạng thái</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 outline-none appearance-none"
                    >
                      <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                      <option value="PAUSED">Tạm dừng (PAUSED)</option>
                      <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isFetchingData}
            className="px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || isFetchingData}
            className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEditing ? 'Lưu thay đổi' : 'Tạo lớp học'}
          </button>
        </div>
      </div>
    </div>
  );
};
