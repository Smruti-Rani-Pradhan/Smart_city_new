import { apiClient, ApiResponse } from './api';
import { API_ENDPOINTS } from '@/config/api';

export interface Incident {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'verified' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  imageUrls?: string[];
  imageUrl?: string;
  reportedBy?: string;
  reporterId?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  assignedTo?: string;
  ticketId?: string;
  severity?: string;
  scope?: string;
  source?: string;
  deviceId?: string;
  createdAt: string;
  updatedAt?: string;
  hasMessages?: boolean;
}

export interface IncidentStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  pending: number;
}

export interface CreateIncidentData {
  title: string;
  description?: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  images?: File[];
}

export interface UpdateIncidentData {
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  location?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const parts = result.split(',');
      const base64 = parts.length > 1 ? parts[1] : '';
      if (!base64) {
        reject(new Error('Invalid image data'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};



export const incidentService = {
  

  async getIncidents(): Promise<ApiResponse<Incident[]>> {
    return apiClient.get<Incident[]>(API_ENDPOINTS.INCIDENTS.LIST);
  },

  

  async getIncidentById(id: string): Promise<ApiResponse<Incident>> {
    return apiClient.get<Incident>(API_ENDPOINTS.INCIDENTS.GET_BY_ID(id));
  },

  

  async createIncident(data: CreateIncidentData): Promise<ApiResponse<Incident>> {
    if (data.images && data.images.length > 0) {
      const base64Images = await Promise.all(data.images.map(fileToBase64));
      const { images, ...incidentData } = data;
      return apiClient.post<Incident>(API_ENDPOINTS.INCIDENTS.CREATE, {
        ...incidentData,
        images: base64Images
      });
    }
    return apiClient.post<Incident>(API_ENDPOINTS.INCIDENTS.CREATE, data);
  },

  

  async updateIncident(id: string, data: UpdateIncidentData): Promise<ApiResponse<Incident>> {
    return apiClient.put<Incident>(API_ENDPOINTS.INCIDENTS.UPDATE(id), data);
  },

  

  async deleteIncident(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.INCIDENTS.DELETE(id));
  },

  

  async getStats(): Promise<ApiResponse<IncidentStats>> {
    return apiClient.get<IncidentStats>(API_ENDPOINTS.INCIDENTS.STATS);
  },
};
