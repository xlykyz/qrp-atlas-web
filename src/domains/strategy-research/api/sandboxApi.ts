import { apiRequest } from '@/shared/api/client';
import type { EquityPoint } from '@/domains/backtests/types/models';
import type { SandboxBenchmarkRequest, SandboxBenchmarkResponse, SandboxRunRequest, SandboxRunResponse } from '../types/sandbox';

export const sandboxApi = {
  /**
   * 运行自定义 Python 策略沙盒测试。
   *
   * 只调用后端真实执行，失败时如实抛出——不做任何本地模拟回退，
   * 否则一次故障会被伪装成"跑通了"，使用者无法分辨结果真假。
   */
  async runSandbox(req: SandboxRunRequest): Promise<SandboxRunResponse> {
    const t0 = performance.now();
    const response = await apiRequest<SandboxRunResponse>('/api/custom-strategies/sandbox-run', {
      method: 'POST',
      body: req,
      timeoutMs: 30_000,
    });
    return { ...response, duration_ms: Math.round(performance.now() - t0) };
  },

  /**
   * 切换对比基准时的轻量重算。
   * 基准只影响绩效后处理，不参与策略执行，因此只传净值序列即可，
   * 无需重跑策略（后端毫秒级返回）。同样不做本地回退。
   */
  async recomputeBenchmark(
    equityPoints: EquityPoint[],
    benchmarkId: string,
  ): Promise<SandboxBenchmarkResponse> {
    return apiRequest<SandboxBenchmarkResponse>('/api/custom-strategies/sandbox-benchmark', {
      method: 'POST',
      body: { equity_points: equityPoints, benchmark_id: benchmarkId } satisfies SandboxBenchmarkRequest,
      timeoutMs: 30_000,
    });
  },
};