import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Check, Copy, Moon, RotateCcw, Sun } from 'lucide-react';
import { SANDBOX_TEMPLATES } from '../lib/sandboxTemplates';

interface SandboxEditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  isPending: boolean;
}

export function SandboxEditor({ code, onChange, onRun, isPending }: SandboxEditorProps) {
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [copied, setCopied] = useState(false);
  const onRunRef = useRef(onRun);

  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        onRunRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // ignore
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    const t = SANDBOX_TEMPLATES.find((item) => item.id === templateId);
    if (t) {
      onChange(t.code);
    }
  };

  const handleReset = () => {
    if (window.confirm('确定重置代码为当前默认模板吗？当前修改将丢失。')) {
      const defaultCode = SANDBOX_TEMPLATES[0]?.code ?? '';
      onChange(defaultCode);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '620px', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: theme === 'vs-dark' ? '#1e1e1e' : '#ffffff' }}>
      {/* Editor top control bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: theme === 'vs-dark' ? '#252526' : 'var(--surface-subtle)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 650, color: theme === 'vs-dark' ? '#9cdcfe' : 'var(--accent)' }}>
            PYTHON 策略脚本
          </span>
          <select
            className="select"
            style={{ height: '26px', fontSize: '11px', padding: '2px 8px', maxWidth: '220px', background: theme === 'vs-dark' ? '#333' : '#fff', color: theme === 'vs-dark' ? '#e0e0e0' : 'inherit', borderColor: theme === 'vs-dark' ? '#555' : 'var(--line-strong)' }}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            defaultValue={SANDBOX_TEMPLATES[0]?.id}
            title="选择内置策略模板"
          >
            {SANDBOX_TEMPLATES.map((tpl) => (
              <option key={tpl.id} value={tpl.id}>
                模板: {tpl.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: theme === 'vs-dark' ? '#888' : 'var(--muted)', marginRight: '6px' }}>
            Ctrl+Enter 运行
          </span>
          <button
            type="button"
            className="button button--sm"
            onClick={handleCopy}
            title="复制全部代码"
            style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}
          >
            {copied ? <Check size={12} color="#17724b" /> : <Copy size={12} />}
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
          <button
            type="button"
            className="button button--sm"
            onClick={handleReset}
            title="重置为初始模板"
            style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}
          >
            <RotateCcw size={12} />
            <span>重置</span>
          </button>
          <button
            type="button"
            className="button button--sm"
            onClick={() => setTheme((t) => (t === 'vs-dark' ? 'light' : 'vs-dark'))}
            title="切换编辑器明暗主题"
            style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}
          >
            {theme === 'vs-dark' ? <Sun size={12} /> : <Moon size={12} />}
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div style={{ flex: 1, position: 'relative', minHeight: '560px' }}>
        <Editor
          height="100%"
          language="python"
          theme={theme}
          value={code}
          onChange={(val) => onChange(val ?? '')}
          options={{
            fontSize: 13,
            fontFamily: '"JetBrains Mono", Consolas, "Courier New", monospace',
            tabSize: 4,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly: isPending,
            wordWrap: 'on',
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    </div>
  );
}
