import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/shell/AppShell';
import { PlaceholderPage } from '@/domains/overview/pages/PlaceholderPage';
import { TodayPage } from '@/domains/today/pages/TodayPage';
import { StrategiesPage } from '@/domains/backtests/pages/StrategiesPage';
import { StrategyDetailPage } from '@/domains/backtests/pages/StrategyDetailPage';
import { BacktestsHomePage } from '@/domains/backtests/pages/BacktestsHomePage';
import { NewBacktestPage } from '@/domains/backtests/pages/NewBacktestPage';
import { TasksPage } from '@/domains/backtests/pages/TasksPage';
import { TaskDetailPage } from '@/domains/backtests/pages/TaskDetailPage';
import { RunsPage } from '@/domains/backtests/pages/RunsPage';
import { RunDetailPage } from '@/domains/backtests/pages/RunDetailPage';
import { ComparePage } from '@/domains/backtests/pages/ComparePage';
import { NotFoundPage } from './NotFoundPage';

export function AppRouter() { return <BrowserRouter><Routes><Route element={<AppShell />}><Route index element={<Navigate to="/today" replace />} /><Route path="today" element={<TodayPage />} /><Route path="review/*" element={<PlaceholderPage kind="review" />} /><Route path="research/*" element={<PlaceholderPage kind="research" />} /><Route path="strategies" element={<StrategiesPage />} /><Route path="strategies/:code" element={<StrategyDetailPage />} /><Route path="backtests" element={<BacktestsHomePage />} /><Route path="backtests/new" element={<NewBacktestPage />} /><Route path="backtests/tasks" element={<TasksPage />} /><Route path="backtests/tasks/:taskId" element={<TaskDetailPage />} /><Route path="backtests/runs" element={<RunsPage />} /><Route path="backtests/runs/:runId" element={<RunDetailPage />} /><Route path="backtests/compare" element={<ComparePage />} /><Route path="operations/*" element={<PlaceholderPage kind="operations" />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes></BrowserRouter>; }
