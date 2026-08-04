import type { IconProps } from "./Icon";

export function HeartIcon({ size = 24, className, ...props }: IconProps) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.8016 22.7998L7.20748 17.7194L2.64949 12.639C0.183569 9.83121 0.183569 5.43668 2.64949 2.6289C3.85695 1.37855 5.49239 0.725146 7.16453 0.825024C8.83666 0.924902 10.3951 1.76907 11.4668 3.15557L11.8016 3.5095L12.1333 3.14032C13.205 1.75383 14.7634 0.909661 16.4356 0.809783C18.1077 0.709905 19.7431 1.36331 20.9506 2.61366C23.4165 5.42144 23.4165 9.81597 20.9506 12.6237L16.3926 17.7042L11.8016 22.7998Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
