import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Field({ label, description, error, children, className }: { label: string; description?: string | undefined; error?: string | undefined; children: ReactNode; className?: string }) {
  return <label className={clsx('field', className)}><span className="field__label">{label}</span>{children}{description ? <span className="field__description">{description}</span> : null}{error ? <span className="field__error">{error}</span> : null}</label>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx('input', props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx('select', props.className)} />;
}
