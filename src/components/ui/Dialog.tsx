import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, labelledBy, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [initialTrigger] = useState(() => document.activeElement);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;
    const activeElement = document.activeElement;
    const trigger =
      activeElement && activeElement !== document.body && !dialog.contains(activeElement)
        ? activeElement
        : initialTrigger;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, [isOpen, initialTrigger]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const dialog = event.currentTarget;
        const controls = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'a[href], area[href], button, input, select, textarea, iframe, object, embed, summary, [tabindex], [contenteditable="true"]',
          ),
        )
          .filter(
            (control) =>
              control.tabIndex >= 0 &&
              !control.matches(':disabled, [aria-disabled="true"]') &&
              !control.closest('[hidden], [inert]') &&
              control.getClientRects().length > 0 &&
              getComputedStyle(control).visibility === 'visible',
          )
          .sort((first, second) => {
            const firstOrder = first.tabIndex > 0 ? first.tabIndex : Infinity;
            const secondOrder = second.tabIndex > 0 ? second.tabIndex : Infinity;
            return firstOrder === secondOrder ? 0 : firstOrder - secondOrder;
          });
        const first = controls[0];
        const last = controls.at(-1);
        if (!first || !last) {
          event.preventDefault();
          dialog.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            !controls.includes(document.activeElement as HTMLElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !controls.includes(document.activeElement as HTMLElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={cn(
        'm-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--kokpit-border-strong)] bg-[var(--kokpit-surface-1)] p-5 text-[var(--kokpit-text-primary)] shadow-[var(--shadow-float)] backdrop:bg-black/60',
        className,
      )}
    >
      {isOpen && children}
    </dialog>
  );
}
