import { Toaster as Sonner } from "sonner"
import { CheckCircle2, CircleAlert, Info, LoaderCircle } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      duration={3000}
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-600" />,
        error: <CircleAlert className="size-4 text-rose-600" />,
        warning: <CircleAlert className="size-4 text-amber-600" />,
        info: <Info className="size-4 text-primary" />,
        loading: <LoaderCircle className="size-4 animate-spin text-primary" />,
      }}
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border-border group-[.toaster]:bg-white group-[.toaster]:p-4 group-[.toaster]:text-foreground group-[.toaster]:shadow-lg",
          title: "text-sm font-medium leading-5",
          description: "group-[.toast]:text-slate-500 text-sm leading-5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
