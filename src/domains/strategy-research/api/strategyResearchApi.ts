import { apiRequest } from '@/shared/api/client';
import type { DeclarativeRecord, DeclarativeStatus, DeclarativeValidation, IndicatorCatalogItem } from '../types/models';
const enc=encodeURIComponent;
export const strategyResearchApi={
 listIndicators:()=>apiRequest<IndicatorCatalogItem[]>('/api/indicators'),
 listDeclarative:(includeArchived=false)=>apiRequest<DeclarativeRecord[]>(`/api/declarative-strategies?include_archived=${String(includeArchived)}`),
 getDeclarative:(code:string,version:string)=>apiRequest<DeclarativeRecord>(`/api/declarative-strategies/${enc(code)}/${enc(version)}`),
 validateDeclarative:(definition:Record<string,unknown>)=>apiRequest<DeclarativeValidation>('/api/declarative-strategies/validate',{method:'POST',body:{definition}}),
 createDeclarative:(definition:Record<string,unknown>)=>apiRequest<DeclarativeRecord>('/api/declarative-strategies',{method:'POST',body:{definition}}),
 createVersion:(code:string,definition:Record<string,unknown>)=>apiRequest<DeclarativeRecord>(`/api/declarative-strategies/${enc(code)}/versions`,{method:'POST',body:{definition}}),
 setStatus:(code:string,version:string,status:DeclarativeStatus)=>apiRequest<DeclarativeRecord>(`/api/declarative-strategies/${enc(code)}/${enc(version)}/status`,{method:'POST',body:{status}}),
};
