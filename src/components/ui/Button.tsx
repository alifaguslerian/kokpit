import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--kokpit-accent)] text-[var(--kokpit-text-inverse)] hover:bg-[var(--kokpit-accent-hover)] active:bg-[var(--kokpit-accent-active)] font-medium shadow-sm',
  secondary:
    'bg-[var(--kokpit-surface-2)] text-[var(--kokpit-text-primary)] border border-[var(--kokpit-border-default)] hover:bg-[var(--kokpit-surface-hover)] active:bg-[var(--kokpit-surface-active)]',
  ghost:
    'bg-transparent text-[var(--kokpit-text-secondary)] hover:text-[var(--kokpit-text-primary)] hover:bg-white/[0.04] active:bg-white/[0.07]',
  danger:
    'bg-[var(--kokpit-danger-bg)] text-[var(--kokpit-danger)] border border-[var(--kokpit-danger)]/30 hover:bg-[var(--kokpit-danger-bg)]/80 active:bg-[var(--kokpit-danger-bg)]/60',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-[10px] gap-1.5',
  md: 'h-10 px-4 text-sm rounded-[12px] gap-2',
  lg: 'h-12 px-5 text-base rounded-[14px] gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isButtonDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isButtonDisabled}
      className={cn(
        'inline-flex items-center justify-center font-ui font-medium transition-all duration-[var(--motion-fast)] ease-[var(--ease-default)] active:scale-[0.98] select-none cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-[var(--kokpit-accent)] focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:brightness-100',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});
