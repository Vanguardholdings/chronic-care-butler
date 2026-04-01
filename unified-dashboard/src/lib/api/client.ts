const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
}

export async function apiClient(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, token } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    method,
    headers,
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
}

// Patient API
export const patientsApi = {
  getAll: (token: string) => apiClient('/patients', { token }),
  getById: (id: string, token: string) => apiClient(`/patients/${id}`, { token }),
  create: (data: any, token: string) => apiClient('/patients', { method: 'POST', body: data, token }),
  update: (id: string, data: any, token: string) => apiClient(`/patients/${id}`, { method: 'PUT', body: data, token }),
  delete: (id: string, token: string) => apiClient(`/patients/${id}`, { method: 'DELETE', token }),
};

// Medication API
export const medicationsApi = {
  getAll: (token: string) => apiClient('/medications', { token }),
  getByPatient: (patientId: string, token: string) => apiClient(`/patients/${patientId}/medications`, { token }),
  create: (data: any, token: string) => apiClient('/medications', { method: 'POST', body: data, token }),
  update: (id: string, data: any, token: string) => apiClient(`/medications/${id}`, { method: 'PUT', body: data, token }),
  delete: (id: string, token: string) => apiClient(`/medications/${id}`, { method: 'DELETE', token }),
};

// Appointment API
export const appointmentsApi = {
  getAll: (token: string) => apiClient('/appointments', { token }),
  create: (data: any, token: string) => apiClient('/appointments', { method: 'POST', body: data, token }),
  update: (id: string, data: any, token: string) => apiClient(`/appointments/${id}`, { method: 'PUT', body: data, token }),
};

// Alert API
export const alertsApi = {
  getAll: (token: string) => apiClient('/alerts', { token }),
  markAsRead: (id: string, token: string) => apiClient(`/alerts/${id}/read`, { method: 'PUT', token }),
};
