import type { IconProps } from "./Icon";

export function HomeIcon({ size = 24, className, ...props }: IconProps) {
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
      <path
        d="M0.699951 9.75902L11.2 0.700195L21.7 9.75902V22.7002H15.1375V17.5237C15.1375 16.4941 14.7226 15.5066 13.9842 14.7785C13.2457 14.0504 12.2442 13.6414 11.2 13.6414C10.1556 13.6414 9.15417 14.0504 8.41573 14.7785C7.6773 15.5066 7.26246 16.494 7.26246 17.5237V22.7002H0.699964L0.699951 9.75902Z"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
