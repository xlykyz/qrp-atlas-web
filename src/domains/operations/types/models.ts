export interface HealthResponse {
  status: string;
  tables: string[];
}

export interface TableCoverageDto {
  rows: number;
  earliest_date: string | null;
  latest_date: string | null;
}

export interface StatsResponse {
  database: string;
  size_bytes: number;
  tables: Record<string, TableCoverageDto>;
}

export interface OpenApiDocument {
  info: { title?: string; version?: string };
  paths: Record<string, unknown>;
}

export type DatasetGroup = 'market' | 'research' | 'fundamental' | 'reference' | 'user';
export type FreshnessState = 'current' | 'lagging' | 'empty' | 'ahead' | 'unknown';
export interface DatasetStatus {
  key: string;
  label: string;
  group: DatasetGroup;
  rows: number;
  earliestDate: string | null;
  latestDate: string | null;
  lagDays: number | null;
  expectedLagDays: number | null;
  state: FreshnessState;
}

export interface ContractRequirement {
  group: string;
  label: string;
  path: string;
  priority: 'required' | 'planned';
}

export interface ContractStatus extends ContractRequirement {
  deployed: boolean;
}
