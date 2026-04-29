import * as React from "react";
import { createPortal } from "react-dom";
import { ScrollArea, ScrollBar } from "@/Components/ui/scroll-area";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { DitherShader } from "@/Components/ui/dither-shader";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/Components/ui/sheet";
import { Info } from "lucide-react";
import profile from "../../../images/profile-two.png";
import pointer from "../../../images/pointer.png";
import pin from "../../../images/pin.png";

const SHADER_PROPS = {
  gridSize: 2,
  ditherMode: "bayer" as const,
  colorMode: "duotone" as const,
  primaryColor: "#214cf1",
  secondaryColor: "#f5f5f5",
  threshold: 0.45,
};

export interface StepButton {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
}

export interface StepInfo {
  title: string;
  description: React.ReactNode;
}

export interface Step {
  title: string;
  image: string;
  description: string;
  buttons?: StepButton[];
  info?: StepInfo;
}

const steps: Step[] = [
  {
    title: "Set up your profile",
    image: profile,
    description: "Complete your details so students can learn more about your team.",
    buttons: [{ label: "Edit Profile", href: "/company/profile" }],
    info: {
      title: "Why set up your profile?",
      description: (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>A complete profile helps students learn more about your team and increases your visibility to prospective candidates.</p>
        </div>
      ),
    },
  },
  {
    title: "Publish a quota",
    image: pointer,
    description: "Start creating job postings to attract talented students.",
    buttons: [{ label: "Create quotas", href: "/company/quotas" }],
  },
  {
    title: "Track applications",
    image: pin,
    description: "Review and manage the applications you've received.",
    buttons: [{ label: "View all", href: "/company/applications" }],
  },
];

// Cursor-following tooltip rendered into document.body via portal
function CursorTooltip({ text, x, y }: { text: string; x: number; y: number }) {
  return createPortal(
    <div
      className="pointer-events-none fixed z-50 rounded-md bg-popover text-popover-foreground text-xs px-2 py-1 shadow-md border"
      style={{ top: y + 14, left: x + 14 }}
    >
      {text}
    </div>,
    document.body
  );
}

function StepCard({ step }: { step: Step }) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [cursor, setCursor] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursor({ x: e.clientX, y: e.clientY });
  };

  const handleMarkAsDone = () => {
    // logic
  };

  return (
    <>
      <Card className="relative h-[200px] w-[500px] shrink-0 flex flex-row overflow-hidden shadow-none">

        {/* Image section — no CardContent padding needed */}
        <div className="w-[150px] shrink-0 bg-muted overflow-hidden">
          <DitherShader
            {...SHADER_PROPS}
            src={step.image}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content section */}
        <CardContent className="flex flex-col justify-between flex-grow min-w-0 p-4">

          {/* Info icon in top-right, inside CardContent */}
          {step.info && (
            <div className="absolute top-0 right-0 p-3">
              <button
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setSheetOpen(true)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="More information"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-1 pr-6">
            <h3 className="font-semibold whitespace-normal">{step.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-normal">{step.description}</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              {step.buttons?.map((btn) =>
                btn.href ? (
                  <Button key={btn.label} size="sm" variant={btn.variant ?? "default"} asChild>
                    <a href={btn.href}>{btn.label}</a>
                  </Button>
                ) : (
                  <Button key={btn.label} size="sm" variant={btn.variant ?? "default"} onClick={btn.onClick}>
                    {btn.label}
                  </Button>
                )
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="shrink-0 text-primary border-none shadow-none hover:bg-primary/10 hover:text-primary"
              onClick={handleMarkAsDone}
            >
              Mark as done
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Cursor-following tooltip */}
      {step.info && hovered && (
        <CursorTooltip text="More info" x={cursor.x} y={cursor.y} />
      )}

      {/* Sheet */}
      {step.info && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{step.info.title}</SheetTitle>
              <SheetDescription asChild>
                <div>{step.info.description}</div>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

export function ScrollAreaHorizontalDemo() {
  return (
    <ScrollArea className="w-full rounded-md">
      <div className="flex w-max space-x-4 py-4 px-1">
        {steps.map((step) => (
          <StepCard key={step.title} step={step} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}