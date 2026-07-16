export interface IndicatorCatalogItem { code: string; name: string; layer: string; scope: string; frequency: string; description: string }
export interface DeclarativeRecord { code: string; version: string; owner_user_id: string; name: string; description: string; status: string; definition: Record<string, unknown>; created_at: string; archived_at?: string | null; referenced_by_runs: boolean }
export interface DeclarativeValidation { ok: boolean; code: string; version: string; normalized: Record<string, unknown>; canonical_json: string }
export type DeclarativeStatus = 'active'|'archived'|'disabled';
export interface RuleDraft { code: string; name: string; version: string; description: string; field: string; entryOperator: 'gt'|'gte'|'lt'|'lte'|'eq'|'ne'; entryValue: number; exitOperator: 'gt'|'gte'|'lt'|'lte'|'eq'|'ne'; exitValue: number }
