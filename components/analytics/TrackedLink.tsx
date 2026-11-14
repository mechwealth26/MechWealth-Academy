"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { trackConversion } from "@/lib/analytics";

type Props = Omit<ComponentProps<typeof Link>, "onClick"> & {
  children: ReactNode;
  eventName: string;
  eventProperties?: Record<string, string | number | boolean>;
};

export default function TrackedLink({
  children,
  eventName,
  eventProperties,
  ...props
}: Props) {
  return (
    <Link
      {...props}
      onClick={() => trackConversion(eventName, eventProperties)}
    >
      {children}
    </Link>
  );
}
