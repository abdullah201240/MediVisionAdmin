"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        // Determine icon based on variant
        let icon = null;
        switch (variant) {
          case "success":
            icon = <CheckCircle className="h-5 w-5 text-green-500" />;
            break;
          case "destructive":
            icon = <AlertCircle className="h-5 w-5 text-red-500" />;
            break;
          case "warning":
            icon = <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            break;
          case "info":
            icon = <Info className="h-5 w-5 text-blue-500" />;
            break;
          default:
            icon = null;
        }

        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex items-start gap-3">
              {icon && (
                <div className="pt-0.5">
                  {icon}
                </div>
              )}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}