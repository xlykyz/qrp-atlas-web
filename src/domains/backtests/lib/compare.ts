export function parseCompareRunIds(search: string): string[] {
  const params = new URLSearchParams(search);
  const values = [...params.getAll('run'), ...params.getAll('run_ids').flatMap((value) => value.split(','))];
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, 6);
}
export function buildCompareSearch(ids: string[]): string {
  const params = new URLSearchParams(); [...new Set(ids)].forEach((id) => params.append('run', id)); return params.toString();
}
