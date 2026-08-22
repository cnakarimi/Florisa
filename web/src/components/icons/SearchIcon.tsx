import type { IconProps } from "./Icon";

export function SearchIcon({ size = 24, className, ...props }: IconProps) {
  const hasAccessibleLabel = Boolean(props["aria-label"]);

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={hasAccessibleLabel ? undefined : true}
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.41467 15.286C4.4824 15.286 1.29472 12.1538 1.29472 8.28385C1.29472 4.41389 4.4824 1.27543 8.41467 1.27543C12.3469 1.27543 15.5353 4.41389 15.5353 8.28385C15.5353 12.1538 12.3469 15.286 8.41467 15.286ZM19.8101 18.9122L14.6469 13.8293C15.9985 12.3601 16.8294 10.422 16.8294 8.28385C16.8294 3.70742 13.0621 0 8.41467 0C3.76722 0 0 3.70742 0 8.28385C0 12.854 3.76722 16.5614 8.41467 16.5614C10.4227 16.5614 12.2644 15.8675 13.711 14.7109L18.8949 19.8124C19.1481 20.0625 19.5575 20.0625 19.8101 19.8124C20.0633 19.5686 20.0633 19.1623 19.8101 18.9122Z"
        fill="currentColor"
      />
    </svg>
  );
}
