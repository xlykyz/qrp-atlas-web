import { apiRequest } from '@/shared/api/client';
import type { HealthResponse, OpenApiDocument, StatsResponse } from '../types/models';

export const operationsApi = {
  getHealth: () => apiRequest<HealthResponse>('/api/health'),
  getStats: () => apiRequest<StatsResponse>('/api/stats'),
  getOpenApi: () => apiRequest<OpenApiDocument>('/openapi.json'),
};
