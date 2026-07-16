import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { apiRequest } from './client';
import type { ApiError } from './errors';
const server=setupServer(http.get('http://127.0.0.1:8001/api/fail',()=>HttpResponse.json({detail:'契约失败'},{status:400})),http.get('http://127.0.0.1:8001/api/broken',()=>new HttpResponse('{',{headers:{'Content-Type':'application/json'}})));
beforeAll(()=>server.listen({onUnhandledRequest:'error'})); afterEach(()=>server.resetHandlers()); afterAll(()=>server.close());
describe('api client',()=>{ it('preserves backend detail on HTTP failures',async()=>{ await expect(apiRequest('/api/fail')).rejects.toMatchObject({kind:'http',status:400,detail:'契约失败'} satisfies Partial<ApiError>); }); it('distinguishes invalid JSON from network failures',async()=>{ await expect(apiRequest('/api/broken')).rejects.toMatchObject({kind:'parse'} satisfies Partial<ApiError>); }); });
