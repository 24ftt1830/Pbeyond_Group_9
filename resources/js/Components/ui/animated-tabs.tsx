import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TabItem {
  value: string;
  label: string;
}

interface AnimatedTabsListProps {
  tabs: TabItem[];
  activeValue: string;
  setActiveValue: (value: string) => void;
  className?: string;
}

export function AnimatedTabsList({ tabs, activeValue, setActiveValue, className }: AnimatedTabsListProps) {
  return (
    <div className={cn("relative flex h-9 items-center rounded-full bg-muted p-1", className)}>
      {tabs.map((tab) => {
        const isActive = activeValue === tab.value;

        return (
          <button
            key={tab.value}
            onClick={() => setActiveValue(tab.value)}
            className={cn(
              "relative z-10 flex h-7 flex-1 items-center justify-center whitespace-nowrap px-3 text-sm font-medium transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {/* The sliding background pill */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 z-0 rounded-full bg-background shadow-sm"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  bounce: 0.3,
                }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}