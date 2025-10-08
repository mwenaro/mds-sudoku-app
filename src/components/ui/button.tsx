import * as React from "react";

type Variant = "default" | "outline" | "ghost";
type Size = "default" | "sm" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none";
const variantClasses: Record<Variant, string> = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700",
  outline: "border border-gray-300 bg-white hover:bg-gray-50",
  ghost: "hover:bg-indigo-50 text-indigo-700",
};
const sizeClasses: Record<Size, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 px-3",
  lg: "h-12 px-6",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const cls = [base, variantClasses[variant], sizeClasses[size], className]
      .filter(Boolean)
      .join(" ");
    return <button ref={ref} className={cls} {...props} />;
  }
);
Button.displayName = "Button";

export default Button;
