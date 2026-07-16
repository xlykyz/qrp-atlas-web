import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export function Panel({ className, children, ...props }: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return <section className={clsx('panel', className)} {...props}>{children}</section>;
}

export function PanelHeader({ title, meta, actions }: { title: ReactNode; meta?: ReactNode; actions?: ReactNode }) {
  return <header className="panel__header"><div><h2>{title}</h2>{meta ? <div className="panel__meta">{meta}</div> : null}</div>{actions ? <div className="panel__actions">{actions}</div> : null}</header>;
}

export function PanelBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('panel__body', className)}>{children}</div>;
}
