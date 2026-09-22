"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-hooks";
import { roleHomePath } from "@/lib/auth";
import { HomePage } from "@/components/marketing/home-page";

export default function Page() {
  return <HomePage />;
}