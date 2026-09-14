import { useState } from 'react';
import { AlertCircle, Check, Copy, Terminal, Trash2 } from 'lucide-react';

interface SandboxConsoleProps {
  logs: string[];
  errorMessage: string | null;
  onClear: () => void;
}

export function SandboxConsole({ logs, errorMessage, onClear }: SandboxConsoleProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'error'>('logs');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = activeTab === 'logs' ? logs.join('\n') : (errorMessage || '无错误信息');
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // ignore
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '260px', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', background: '#181c19', color: '#d0d7d2', overflow: 'hidden' }}>
      {/* Console Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: '#121513', borderBottom: '1px solid #282f2a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            style={{
              background: 'transparent',
              border: 0,
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 650,
              color: activeTab === 'logs' ? '#5ec284' : '#828e85',
              borderBottom: activeTab === 'logs' ? '2px solid #5ec284' : '2px solid transparent',
            }}
          >
            <Terminal size={12} />
            <span>执行日志 ({logs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('error')}
            style={{
              background: 'transparent',
              border: 0,
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 650,
              color: activeTab === 'error' ? '#ef5f5f' : errorMessage ? '#f48787' : '#828e85',
              borderBottom: activeTab === 'error' ? '2px solid #ef5f5f' : '2px solid transparent',
            }}
          >
            <AlertCircle size={12} />
            <span>错误与诊断 {errorMessage ? '(1)' : '(0)'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={handleCopy}
            title="复制当前面板内容"
            style={{ background: 'transparent', border: '1px solid #36413a', borderRadius: '4px', color: '#a0aca2', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {copied ? <Check size={11} color="#5ec284" /> : <Copy size={11} />}
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            title="清空输出日志"
            style={{ background: 'transparent', border: '1px solid #36413a', borderRadius: '4px', color: '#a0aca2', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Trash2 size={11} />
            <span>清空</span>
          </button>
        </div>
      </div>

      {/* Console Content Body */}
      <div style={{ flex: 1, padding: '10px 14px', overflowY: 'auto', fontFamily: '"JetBrains Mono", Consolas, monospace', fontSize: '11px', lineHeight: '1.6' }}>
        {activeTab === 'logs' ? (
          logs.length > 0 ? (
            logs.map((line, idx) => {
              const isHighlight = line.includes('----------------') || line.includes('计算完成') || line.includes('初始化');
              const isDate = line.startsWith('[');
              return (
                <div
                  key={idx}
                  style={{
                    color: isHighlight ? '#65bd86' : isDate ? '#9eb4a4' : '#ccd6ce',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  <span style={{ color: '#4d5951', marginRight: '8px', userSelect: 'none' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {line}
                </div>
              );
            })
          ) : (
            <div style={{ color: '#5b695f', fontStyle: 'italic', padding: '16px 0' }}>
              暂无运行输出。点击上方【编译运行】或按 Ctrl+Enter 触发内存沙盒回测。
            </div>
          )
        ) : errorMessage ? (
          <div style={{ color: '#f87171', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            <strong>[Execution Error]:</strong>
            <pre style={{ margin: '8px 0 0', fontFamily: 'inherit' }}>{errorMessage}</pre>
          </div>
        ) : (
          <div style={{ color: '#5b695f', fontStyle: 'italic', padding: '16px 0' }}>
            无异常错误，策略编译与执行未捕获到运行时异常。
          </div>
        )}
      </div>
    </div>
  );
}
