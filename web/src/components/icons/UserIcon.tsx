import type { IconProps } from "./Icon";

export function UserIcon({ size = 24, className, ...props }: IconProps) {
  const hasAccessibleLabel = Boolean(props["aria-label"]);

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={hasAccessibleLabel ? undefined : true}
      focusable="false"
    >
      <circle
        cx="12"
        cy="7.5"
        r="6.25"
        stroke="currentColor"
        strokeWidth={1.5}
      />

      <path
        d="M1.25 22.25V20.25C1.25 18.75 2.1 17.38 3.45 16.7C6.08 15.38 8.99 14.69 11.93 14.7C14.91 14.69 17.85 15.4 20.51 16.75C21.88 17.45 22.75 18.86 22.75 20.4V22.25H1.25Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
