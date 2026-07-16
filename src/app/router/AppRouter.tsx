import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/shell/AppShell';
import { LoadingState } from '@/shared/ui';
import { NotFoundPage } from './NotFoundPage';

const PlaceholderPage = lazy(() => import('@/domains/overview/pages/PlaceholderPage').then((module) => ({ default: module.PlaceholderPage })));
const TodayPage = lazy(() => import('@/domains/today/pages/TodayPage').then((module) => ({ default: module.TodayPage })));
const MarketReviewPage = lazy(() => import('@/domains/market-review/pages/MarketReviewPage').then((module) => ({ default: module.MarketReviewPage })));
const StocksPage = lazy(() => import('@/domains/stocks/pages/StocksPage').then((module) => ({ default: module.StocksPage })));
const StockDetailPage = lazy(() => import('@/domains/stocks/pages/StockDetailPage').then((module) => ({ default: module.StockDetailPage })));
const ResearchRecordsPage = lazy(() => import('@/domains/research-records/pages/ResearchRecordsPage').then((module) => ({ default: module.ResearchRecordsPage })));
const OperationsPage = lazy(() => import('@/domains/operations/pages/OperationsPage').then((module) => ({ default: module.OperationsPage })));
const StrategiesPage = lazy(() => import('@/domains/backtests/pages/StrategiesPage').then((module) => ({ default: module.StrategiesPage })));
const StrategyDetailPage = lazy(() => import('@/domains/backtests/pages/StrategyDetailPage').then((module) => ({ default: module.StrategyDetailPage })));
const BacktestsHomePage = lazy(() => import('@/domains/backtests/pages/BacktestsHomePage').then((module) => ({ default: module.BacktestsHomePage })));
const NewBacktestPage = lazy(() => import('@/domains/backtests/pages/NewBacktestPage').then((module) => ({ default: module.NewBacktestPage })));
const TasksPage = lazy(() => import('@/domains/backtests/pages/TasksPage').then((module) => ({ default: module.TasksPage })));
const TaskDetailPage = lazy(() => import('@/domains/backtests/pages/TaskDetailPage').then((module) => ({ default: module.TaskDetailPage })));
const RunsPage = lazy(() => import('@/domains/backtests/pages/RunsPage').then((module) => ({ default: module.RunsPage })));
const RunDetailPage = lazy(() => import('@/domains/backtests/pages/RunDetailPage').then((module) => ({ default: module.RunDetailPage })));
const ComparePage = lazy(() => import('@/domains/backtests/pages/ComparePage').then((module) => ({ default: module.ComparePage })));

export function AppRouter() {
  return <BrowserRouter><Suspense fallback={<LoadingState label="正在载入研究工作区..." />}><Routes><Route element={<AppShell />}>
    <Route index element={<Navigate to="/today" replace />} />
    <Route path="today" element={<TodayPage />} />
    <Route path="review" element={<Navigate to="/review/market" replace />} />
    <Route path="review/market" element={<MarketReviewPage />} />
    <Route path="review/*" element={<PlaceholderPage kind="review" />} />
    <Route path="research" element={<Navigate to="/research/stocks" replace />} />
    <Route path="research/stocks" element={<StocksPage />} />
    <Route path="research/stocks/:ticker" element={<StockDetailPage />} />
    <Route path="research/notes" element={<ResearchRecordsPage />} />
    <Route path="research/*" element={<PlaceholderPage kind="research" />} />
    <Route path="strategies" element={<StrategiesPage />} />
    <Route path="strategies/:code" element={<StrategyDetailPage />} />
    <Route path="backtests" element={<BacktestsHomePage />} />
    <Route path="backtests/new" element={<NewBacktestPage />} />
    <Route path="backtests/tasks" element={<TasksPage />} />
    <Route path="backtests/tasks/:taskId" element={<TaskDetailPage />} />
    <Route path="backtests/runs" element={<RunsPage />} />
    <Route path="backtests/runs/:runId" element={<RunDetailPage />} />
    <Route path="backtests/compare" element={<ComparePage />} />
    <Route path="operations" element={<OperationsPage />} />
    <Route path="operations/*" element={<OperationsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes></Suspense></BrowserRouter>;
}
