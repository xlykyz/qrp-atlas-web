import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

export function Button({ className, variant = 'secondary', size = 'md', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; children: ReactNode }) {
  return <button className={clsx('button', `button--${variant}`, `button--${size}`, className)} {...props}>{children}</button>;
}
