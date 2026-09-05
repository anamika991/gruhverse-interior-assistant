import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-copper text-white hover:bg-copper-dark disabled:bg-line disabled:text-ink-soft",
  secondary:
    "border border-line bg-card text-ink hover:border-ink/30 disabled:opacity-50",
  ghost: "text-ink-soft hover:bg-paper-2 hover:text-ink disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
