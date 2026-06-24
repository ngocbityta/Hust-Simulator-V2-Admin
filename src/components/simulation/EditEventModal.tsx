import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Calendar as CalendarIcon, MapPin, Building, Users } from 'lucide-react';
import { apiFetch } from '../../utils/api';

interface EditEventModalProps {
  event: any | null; // null means Create
  onClose: () => void;
  onSuccess: () => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ event, onClose, onSuccess }) => {
  const isEditing = !!event;
  
  const [formData, setFormData] = useState({
    name: event?.name || '',
    description: event?.description || '',
    mapId: event?.mapId || '',
    startTime: event?.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '',
    endTime: event?.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '',
    type: event?.type || 'INDOOR',
    estimatedParticipants: event?.estimatedParticipants || 50,
    status: event?.status || 'SCHEDULED',
    buildingId: event?.buildingId || '',
  });

  const [maps, setMaps] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mapsRes, buildingsRes] = await Promise.all([
          apiFetch('/maps'),
          apiFetch('/buildings')
        ]);
        setMaps(mapsRes);
        setBuildings(buildingsRes);
        
        // Auto-select first map if creating and none selected
        if (!isEditing && !formData.mapId && mapsRes.length > 0) {
          setFormData(prev => ({ ...prev, mapId: mapsRes[0].id }));
        }
      } catch (err) {
        console.error('Failed to fetch maps/buildings', err);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchData();
  }, [isEditing, formData.mapId]);

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
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        estimatedParticipants: formData.estimatedParticipants,
      };

      if (isEditing) {
        payload.status = formData.status;
      } else {
        payload.type = formData.type;
      }

      if (formData.type === 'INDOOR' && formData.buildingId) {
        payload.buildingId = formData.buildingId;
        payload.roomIds = []; // Optional rooms
      } else if (formData.type === 'OUTDOOR') {
        payload.coordinate = { minX: 0, minY: 0, maxX: 0, maxY: 0 }; // Default temp coordinates
      }

      if (isEditing) {
        await apiFetch(`/events/${event.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/events`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu sự kiện');
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
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{isEditing ? 'Sửa Sự Kiện' : 'Tạo Sự Kiện Mới'}</h2>
              {isEditing && <p className="text-sm text-zinc-500 mt-0.5 font-mono">ID: {event.id.substring(0, 8)}...</p>}
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
              <Loader2 className="animate-spin text-amber-500" size={32} />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Tên sự kiện *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Bắt đầu *</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Kết thúc *</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-2"><Users size={16}/> Số người dự kiến</label>
                  <input
                    type="number"
                    name="estimatedParticipants"
                    value={formData.estimatedParticipants}
                    onChange={handleChange}
                    min={0}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                  />
                </div>

                {!isEditing && (
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-2"><MapPin size={16}/> Loại địa điểm</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none appearance-none"
                    >
                      <option value="INDOOR">Trong nhà (INDOOR)</option>
                      <option value="OUTDOOR">Ngoài trời (OUTDOOR)</option>
                    </select>
                  </div>
                )}

                {isEditing && (
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-2"><CalendarIcon size={16}/> Trạng thái</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none appearance-none"
                    >
                      <option value="SCHEDULED">Sắp diễn ra</option>
                      <option value="ONGOING">Đang diễn ra</option>
                      <option value="COMPLETED">Đã kết thúc</option>
                      <option value="CANCELLED">Đã hủy</option>
                      <option value="DRAFT">Bản nháp</option>
                    </select>
                  </div>
                )}
              </div>

              {formData.type === 'INDOOR' && (
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-2"><Building size={16}/> Tòa nhà</label>
                  <select
                    name="buildingId"
                    value={formData.buildingId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none appearance-none"
                  >
                    <option value="">Chọn tòa nhà...</option>
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Bản đồ (Map)</label>
                <select
                  name="mapId"
                  value={formData.mapId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none appearance-none"
                >
                  <option value="">Chọn bản đồ...</option>
                  {maps.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
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
            className="px-6 py-2.5 text-sm font-medium text-zinc-950 bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEditing ? 'Lưu thay đổi' : 'Tạo sự kiện'}
          </button>
        </div>
      </div>
    </div>
  );
};
