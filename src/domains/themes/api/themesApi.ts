import{apiRequest}from'@/shared/api/client';import type{IndustryReport}from'../types/models';
export const themesApi={listIndustryEvidence:(limit=30)=>apiRequest<IndustryReport[]>(`/api/reports/industry?limit=${limit}`)};
