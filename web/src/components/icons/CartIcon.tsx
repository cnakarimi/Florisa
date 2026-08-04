import type { IconProps } from "./Icon";

export function CartIcon({ size = 24, className, ...props }: IconProps) {
  const hasAccessibleLabel = Boolean(props["aria-label"]);

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 20 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={hasAccessibleLabel ? undefined : true}
      focusable="false"
    >
      <path
        d="M0.750816 16.5168C0.702082 19.2347 2.84269 21.4784 5.53324 21.5296H13.9668C16.6573 21.4784 18.7979 19.2347 18.7492 16.5168L18.1874 10.4288C18.0448 8.13361 16.4548 6.19245 14.2496 5.6212C13.7901 5.48617 13.314 5.4171 12.8354 5.41602H6.66457C6.18599 5.4171 5.70994 5.48617 5.25041 5.6212C3.04654 6.19263 1.45741 8.13236 1.31391 10.4262L0.750816 16.5168Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M14.2497 7.7479V5.12334C14.2012 2.66134 12.1874 0.704452 9.75008 0.750807C7.31276 0.704452 5.29901 2.66134 5.25049 5.12334V7.7466"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
