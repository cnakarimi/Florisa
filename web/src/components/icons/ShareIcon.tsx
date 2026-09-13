import type { IconProps } from "./Icon";

export function ShareIcon({ size = 24, className, ...props }: IconProps) {
  const hasAccessibleLabel = Boolean(props["aria-label"]);

  return (
    <svg
      {...props}
      width={size}
      height={size}
      viewBox="0 0 21 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={hasAccessibleLabel ? undefined : true}
      focusable="false"
    >
      <path
        d="M6.92444 10.9629C6.92444 12.6671 5.54167 14.0499 3.83789 14.0499"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M3.83797 14.0499C2.13234 14.0499 0.75 12.6671 0.75 10.9629"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M0.75 10.9635C0.75 9.25832 2.13234 7.87598 3.83797 7.87598"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M3.83789 7.87598C5.54167 7.87598 6.92444 9.25832 6.92444 10.9635"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M19.7501 18.0879C19.7501 19.7921 18.3659 21.1754 16.6616 21.1754"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M16.6615 21.1754C14.9577 21.1754 13.5735 19.7921 13.5735 18.0879"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.5735 18.0875C13.5735 16.3823 14.9577 14.9995 16.6615 14.9995"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M16.6616 14.9995C18.3659 14.9995 19.7501 16.3823 19.7501 18.0875"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M19.7501 3.83887C19.7501 5.54312 18.3659 6.92589 16.6616 6.92589"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M16.6615 6.92589C14.9577 6.92589 13.5735 5.54312 13.5735 3.83887"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.5735 3.83844C13.5735 2.13329 14.9577 0.75 16.6615 0.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M16.6616 0.75C18.3659 0.75 19.7501 2.13324 19.7501 3.83844"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.56738 9.29906L13.8111 5.20361"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M13.9006 16.4465L6.65552 12.3501"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="2.6131"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
