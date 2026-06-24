export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('admin_token');
  
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Only set application/json if we are not sending FormData
  if (!(options.body instanceof FormData) && !headers.hasOwnProperty('Content-Type') && !('Content-Type' in headers)) {
    (headers as any)['Content-Type'] = 'application/json';
  }

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = import.meta.env.VITE_API_URL || 'https://hustsimulator.id.vn/api';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch {
      // Not JSON
    }
    throw new Error(errorData?.message || 'API request failed');
  }

  return response.json();
};

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  // We may need X-User-Id if gateway doesn't set it for some reason, but we try without it first or pass from token
  const adminUserStr = localStorage.getItem('admin_user');
  let userId = '';
  if (adminUserStr) {
    try {
      const u = JSON.parse(adminUserStr);
      userId = u.id || '';
    } catch(e) {}
  }

  const headers: any = {};
  if (userId) {
    headers['X-User-Id'] = userId;
  }

  const result = await apiFetch('/storage/upload', {
    method: 'POST',
    body: formData,
    headers
  });
  
  return result.url || result.fileUrl || result.path || result.id; // We will use the URL returned by the backend
};

