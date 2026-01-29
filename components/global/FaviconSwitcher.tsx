"use client";

import { useEffect } from "react";
import { initFaviconSwitcher } from "@/lib/favicon";

export default function FaviconSwitcher() {
  useEffect(() => {
    initFaviconSwitcher();
  }, []);

  return null;
}
