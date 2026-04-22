import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";

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
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const activeIndex = tabs.findIndex((t) => t.value === activeValue);
    const activeTab = tabsRef.current[activeIndex];

    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.clientWidth,
      });
    }
  }, [activeValue, tabs]);

  return (
    <div className={cn("relative flex h-9 items-center rounded-full bg-muted p-1", className)}>
      {/* Sliding Background Indicator */}
      <div
        className="absolute bottom-1 top-1 z-0 rounded-full bg-background shadow-sm transition-all duration-300 ease-out"
        style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
      />

      {tabs.map((tab, index) => (
        <button
          key={tab.value}
          ref={(el) => (tabsRef.current[index] = el)}
          onClick={() => setActiveValue(tab.value)}
          className={cn(
            "relative z-10 flex h-7 flex-1 items-center justify-center whitespace-nowrap px-3 text-sm font-medium transition-colors",
            activeValue === tab.value ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}