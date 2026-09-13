import type { IconProps } from "./Icon";

export function HeartOutlineIcon({
  size = 24,
  className,
  ...props
}: IconProps) {
  const hasAccessibleLabel = Boolean(props["aria-label"]);

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 23 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={hasAccessibleLabel ? undefined : true}
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.3632 20.4476L6.93124 15.8989L2.53415 11.3501C0.155283 8.83621 0.155283 4.9016 2.53415 2.38767C3.69899 1.26817 5.2767 0.683155 6.8898 0.77258C8.50291 0.862005 10.0063 1.61783 11.0402 2.85922L11.3632 3.17611L11.6831 2.84557C12.7171 1.60418 14.2205 0.848359 15.8336 0.758934C17.4467 0.669509 19.0244 1.25453 20.1892 2.37402C22.5681 4.88795 22.5681 8.82256 20.1892 11.3365L15.7921 15.8852L11.3632 20.4476Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
