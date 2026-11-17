import { cn } from "@/lib/utils";

const palettes = [
  "bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
];

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

interface AvatarProps {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}

function hashName(name: string): number {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }
  return hash % palettes.length;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const parts = name.trim().split(/\s+/);
  const initials = `${parts[0]?.charAt(0) ?? ""}${
    parts.length > 1 ? parts[parts.length - 1].charAt(0) : ""
  }`.toUpperCase();

  return (
    <span
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizes[size],
        palettes[hashName(name)],
        className
      )}
    >
      {initials || "?"}
    </span>
  );
}
