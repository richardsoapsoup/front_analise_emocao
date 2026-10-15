const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export const api = {
  baseUrl: API_BASE_URL,
  getEventos: (limit = 500) => request(`/eventos?limit=${limit}`),
  getResumoRelatorios: () => request('/relatorios/resumo'),
  getRelatorioUsuarios: () => request('/relatorios/usuarios'),
  getUsuarios: () => request('/usuarios?ativos=true'),
  createUsuario: (payload) => request('/usuarios', { method: 'POST', body: JSON.stringify(payload) }),
  deleteUsuario: (id) => request(`/usuarios/${id}`, { method: 'DELETE' }),
  getCameras: () => request('/cameras'),
  createCamera: (payload) => request('/cameras', { method: 'POST', body: JSON.stringify(payload) }),
  updateCamera: (id, payload) => request(`/cameras/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCamera: (id) => request(`/cameras/${id}`, { method: 'DELETE' }),
  startCamera: (id) => request(`/cameras/${id}/start`, { method: 'POST' }),
  stopCamera: (id) => request(`/cameras/${id}/stop`, { method: 'POST' }),
  releaseCamera: (id) => request(`/cameras/${id}/release`, { method: 'POST' }),
  updateCameraMode: (id, modo) => request(`/cameras/${id}/modo?modo_monitoramento=${modo}`, { method: 'PUT' }),
  videoFeedUrl: (id) => `${API_BASE_URL}/video_feed/${id}`,
  getAlertas: (limit = 50, status = null) => request(`/alertas?limit=${limit}${status ? `&status=${status}` : ''}`),
  updateAlertaStatus: (id, status) => request(`/alertas/${id}/status?status=${status}`, { method: 'PUT' }),
  deleteAlerta: (id) => request(`/alertas/${id}`, { method: 'DELETE' }),
  getAlertasConfig: () => request('/alertas/config'),
  updateAlertasConfig: (payload) => request('/alertas/config', { method: 'PUT', body: JSON.stringify(payload) }),
  testarAlerta: () => request('/alertas/testar', { method: 'POST' }),
  alertaImageUrl: (url) => url ? `${API_BASE_URL}${url}` : null,
};
