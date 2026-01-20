"use client";

import { useEffect } from "react";
import { initFaviconSwitcher } from "@/utils/favicon";

export default function FaviconSwitcher() {
  useEffect(() => {
    initFaviconSwitcher();
  }, []);

  return null;
}
