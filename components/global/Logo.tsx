"use client";

import Image from "next/image";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";

interface LogoProps {
    width?: number;
    height?: number;
    className?: string;
}

export default function Logo({ width = 48, height = 48, className = "" }: LogoProps) {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by showing a default logo until mounted
    if (!mounted) {
        return (
            <Image
                src="/logo/white-logo-removebg.png"
                alt="Ramana Bouquets Logo"
                width={width}
                height={height}
                className={`object-contain ${className}`}
                priority
            />
        );
    }

    return (
        <Image
            src={theme === "dark" ? "/logo/black-logo-removebg.png" : "/logo/white-logo-removebg.png"}
            alt="Ramana Bouquets Logo"
            width={width}
            height={height}
            className={`object-contain ${className}`}
            priority
        />
    );
}