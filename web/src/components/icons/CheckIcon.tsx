import type { IconProps } from "./Icon";

export function CheckIcon({ size = 14, className, ...props }: IconProps) {
  const hasAccessibleLabel = Boolean(props["aria-label"]);

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={hasAccessibleLabel ? undefined : true}
      focusable="false"
    >
      <path
        d="M11.6949 3.70507C11.9681 3.97842 11.9681 4.42152 11.6949 4.69487L6.09488 10.2949C5.82153 10.5681 5.37843 10.5681 5.10508 10.2949L2.30508 7.49487C2.0398 7.22021 2.04359 6.78361 2.31361 6.5136C2.58362 6.24359 3.02021 6.23979 3.29488 6.50507L5.59998 8.81017L10.7051 3.70507C10.9784 3.43181 11.4215 3.43181 11.6949 3.70507V3.70507"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
      />
    </svg>
  );
}
