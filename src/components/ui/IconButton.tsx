import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'disc';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isActive?: boolean;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary:
    'bg-[var(--kokpit-accent)] text-[var(--kokpit-text-inverse)] hover:bg-[var(--kokpit-accent-hover)] active:bg-[var(--kokpit-accent-active)]',
  secondary:
    'bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] border border-[var(--kokpit-border-default)] hover:bg-[var(--kokpit-surface-hover)] active:bg-[var(--kokpit-surface-active)]',
  ghost:
    'bg-transparent text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.04] active:bg-white/[0.08]',
  disc: 'bg-[var(--kokpit-surface-3)] text-[var(--kokpit-text-primary)] border border-[var(--kokpit-border-subtle)] hover:bg-[var(--kokpit-surface-hover)] active:bg-[var(--kokpit-surface-active)] shadow-sm',
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'w-8 h-8 rounded-[8px] text-sm',
  md: 'w-10 h-10 rounded-[12px] text-base',
  lg: 'w-12 h-12 rounded-[14px] text-lg',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    className,
    icon,
    label,
    variant = 'ghost',
    size = 'md',
    isActive = false,
    disabled = false,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center transition-all duration-[var(--motion-fast)] ease-[var(--ease-default)] active:scale-[0.95] select-none cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-[var(--kokpit-accent)] focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantStyles[variant],
        sizeStyles[size],
        isActive &&
          'bg-[var(--kokpit-accent-bg)] text-[var(--kokpit-accent-hover)] border-[var(--kokpit-accent)]/30',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
});
