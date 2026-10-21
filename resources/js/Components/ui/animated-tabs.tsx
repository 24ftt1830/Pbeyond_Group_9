import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TabItem {
  value: string;
  label: string;
  count?: number;
}

interface AnimatedTabsListProps {
  tabs: TabItem[];
  activeValue: string;
  setActiveValue: (value: string) => void;
  className?: string;
  groupId: string;
}

export function AnimatedTabsList({ tabs, activeValue, setActiveValue, className, groupId }: AnimatedTabsListProps) {
  return (
    <div className={cn("relative flex min-h-11 items-center gap-1 rounded-xl border border-border bg-white p-1", className)}>
      {tabs.map((tab) => {
        const isActive = activeValue === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setActiveValue(tab.value)}
            className={cn(
              "relative z-10 flex min-h-9 flex-1 items-center justify-center whitespace-nowrap px-3 text-sm font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={`activeTab-${groupId}`}
                className="absolute inset-0 z-0 rounded-lg bg-primary/10"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  bounce: 0.3,
                }}
              />
            )}

            <span className="relative z-10 flex items-center gap-1.5">
              {tab.label}

              {tab.count !== undefined && tab.count > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}