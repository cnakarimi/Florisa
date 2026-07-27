import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ورود | برگ سبز",
  description: "ورود و تأیید شماره موبایل در فروشگاه برگ سبز",
};

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return children;
}
