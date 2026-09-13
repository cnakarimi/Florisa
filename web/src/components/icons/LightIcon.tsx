import type { IconProps } from "./Icon";

export function LightIcon({ size = 24, className, ...props }: IconProps) {
  const hasAccessibleLabel = Boolean(props["aria-label"]);

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 25 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={hasAccessibleLabel ? undefined : true}
      focusable="false"
    >
      <path
        d="M7.40995 6.13858L5.14275 3.04171M4.41864 10.2247L0.750244 9.04179M4.41864 15.2753L0.750244 16.4582M7.40995 19.3614L5.14275 22.4583M12.2502 20.9221V24.75M17.0905 19.3614L19.3577 22.4583M20.0818 15.2753L23.7502 16.4582M20.0818 10.2247L23.7502 9.04179M17.0905 6.13858L19.3577 3.04171M12.2502 4.57795V0.75M17.8582 12.75C17.8582 15.8237 15.3474 18.3155 12.2502 18.3155C9.15306 18.3155 6.64229 15.8237 6.64229 12.75C6.64229 9.67628 9.15306 7.18455 12.2502 7.18455C15.3474 7.18455 17.8582 9.67628 17.8582 12.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
