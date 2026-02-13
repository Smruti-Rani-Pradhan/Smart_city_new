import { apiClient, ApiResponse } from './api';
import { API_ENDPOINTS } from '@/config/api';

export interface AnalyticsDashboard {
  incidents: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  cityCleanlinessScore: number;
  safetyIndex: number;
  byCategory: { category: string; count: number }[];
  workerProductivity: {
    worker: string;
    total: number;
    resolved: number;
    open: number;
    inProgress: number;
    resolutionRate: number;
  }[];
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  category?: string;
  status?: string;
}

export interface TrendPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface AnalyticsData {
  incidentsByZone: { name: string; value: number }[];
  incidentsByType: { name: string; value: number }[];
  resolutionTime: { date: string; time: number }[]; // time in hours
  weeklyActivity: { name: string; incidents: number; tickets: number }[];
}

export const analyticsService = {
  async getDashboard(): Promise<ApiResponse<AnalyticsDashboard>> {
    return apiClient.get<AnalyticsDashboard>(API_ENDPOINTS.ANALYTICS.DASHBOARD);
  },

  async getHeatmap(): Promise<ApiResponse<HeatmapPoint[]>> {
    return apiClient.get<HeatmapPoint[]>(API_ENDPOINTS.ANALYTICS.HEATMAP);
  },

  async getTrends(days = 14): Promise<ApiResponse<TrendPoint[]>> {
    return apiClient.get<TrendPoint[]>(`${API_ENDPOINTS.ANALYTICS.TRENDS}?days=${days}`);
  },

  
  getHeatmapData: async (): Promise<HeatmapPoint[]> => {
    return [
      { lat: 20.5937, lng: 78.9629, weight: 1.0 }, // Nagpur/Center
      { lat: 20.6000, lng: 78.9700, weight: 0.8 },
      { lat: 20.5800, lng: 78.9500, weight: 0.6 },
      { lat: 20.6100, lng: 78.9800, weight: 0.9 },
    ];
  },

  getAnalyticsData: async (timeRange: string = '7d'): Promise<AnalyticsData> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          incidentsByZone: [
            { name: 'North Zone', value: 45 },
            { name: 'South Zone', value: 30 },
            { name: 'East Zone', value: 55 },
            { name: 'West Zone', value: 20 },
          ],
          incidentsByType: [
            { name: 'Pothole', value: 40 },
            { name: 'Garbage', value: 25 },
            { name: 'Water', value: 15 },
            { name: 'Electricity', value: 20 },
          ],
          resolutionTime: [
            { date: 'Mon', time: 12 },
            { date: 'Tue', time: 18 },
            { date: 'Wed', time: 10 },
            { date: 'Thu', time: 14 },
            { date: 'Fri', time: 9 },
            { date: 'Sat', time: 22 },
            { date: 'Sun', time: 15 },
          ],
          weeklyActivity: [
            { name: 'Mon', incidents: 12, tickets: 8 },
            { name: 'Tue', incidents: 19, tickets: 12 },
            { name: 'Wed', incidents: 15, tickets: 10 },
            { name: 'Thu', incidents: 22, tickets: 15 },
            { name: 'Fri', incidents: 28, tickets: 20 },
            { name: 'Sat', incidents: 10, tickets: 5 },
            { name: 'Sun', incidents: 8, tickets: 4 },
          ],
        });
      }, 500);
    });
  }
};




// import { apiClient, ApiResponse } from './api';
// import { API_ENDPOINTS } from '@/config/api';

// export interface AnalyticsDashboard {
//   incidents: {
//     total: number;
//     open: number;
//     inProgress: number;
//     resolved: number;
//   };
//   tickets: {
//     total: number;
//     open: number;
//     inProgress: number;
//     resolved: number;
//   };
//   cityCleanlinessScore: number;
//   safetyIndex: number;
//   byCategory: { category: string; count: number }[];
//   workerProductivity: {
//     worker: string;
//     total: number;
//     resolved: number;
//     open: number;
//     inProgress: number;
//     resolutionRate: number;
//   }[];
// }

// export interface HeatmapPoint {
//   lat: number;
//   lng: number;
//   weight: number;
//   category?: string;
//   status?: string;
// }

// export interface TrendPoint {
//   date: string;
//   created: number;
//   resolved: number;
// }

// export const analyticsService = {
//   async getDashboard(): Promise<ApiResponse<AnalyticsDashboard>> {
//     return apiClient.get<AnalyticsDashboard>(API_ENDPOINTS.ANALYTICS.DASHBOARD);
//   },

//   async getHeatmap(): Promise<ApiResponse<HeatmapPoint[]>> {
//     return apiClient.get<HeatmapPoint[]>(API_ENDPOINTS.ANALYTICS.HEATMAP);
//   },

//   async getTrends(days = 14): Promise<ApiResponse<TrendPoint[]>> {
//     return apiClient.get<TrendPoint[]>(`${API_ENDPOINTS.ANALYTICS.TRENDS}?days=${days}`);
//   },
// };
