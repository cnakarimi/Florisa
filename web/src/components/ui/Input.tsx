import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leadingIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    error,
    leadingIcon,
    disabled,
    className = "",
    containerClassName = "",
    ...props
  },
  ref,
) {
  const hasError = Boolean(error);

  return (
    <div className={`w-full ${containerClassName}`}>
      {label ? (
        <label
          htmlFor={id}
          className={`mb-1.5 block text-desktop-ui-label ${
            hasError ? "text-red-500" : "text-text-secondary"
          }`}
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leadingIcon ? (
          <span className="pointer-events-none absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-text-secondary">
            {leadingIcon}
          </span>
        ) : null}

        <input
          {...props}
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={
            hasError && id ? `${id}-error` : props["aria-describedby"]
          }
          className={[
            "h-10 w-full rounded-lg border",
            "bg-background-primary",
            "text-desktop-ui-label text-text-primary",
            "outline-none",
            "transition-[border-color,box-shadow,background-color,opacity]",
            "duration-200",
            "placeholder:text-text-secondary",
            leadingIcon ? "pr-9 pl-3" : "px-3",
            hasError
              ? "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
              : "border-border-subtle hover:border-text-secondary/50 focus:border-action-primary focus:ring-2 focus:ring-action-primary/15",
            "disabled:cursor-not-allowed",
            "disabled:opacity-50",
            className,
          ].join(" ")}
        />
      </div>

      {hasError ? (
        <p
          id={id ? `${id}-error` : undefined}
          role="alert"
          className="mt-1.5 text-xs text-red-500"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
});
