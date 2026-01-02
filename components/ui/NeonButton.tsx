"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "danger" | "success";
    size?: "sm" | "md" | "lg";
    glow?: boolean;
}

export default function NeonButton({
    className,
    variant = "primary",
    size = "md",
    glow = true,
    children,
    ...props
}: NeonButtonProps) {
    const variants = {
        primary: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30",
        danger: "bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30",
        success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-2.5",
        lg: "px-8 py-3 text-lg",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "relative rounded-full border font-medium tracking-wide transition-all duration-300",
                variants[variant],
                sizes[size],
                glow && "hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]",
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children as React.ReactNode}
            </span>
        </motion.button>
    );
}
