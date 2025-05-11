import { toast } from "sonner"

interface UseToastOptions {
  duration?: number
}

export function useToast(options: UseToastOptions = {}) {
  const { duration = 5000 } = options

  const showToast = (message: string, type: 'default' | 'success' | 'warning' | 'error' = 'default') => {
    switch (type) {
      case 'success':
        toast.success(message, { duration })
        break
      case 'warning':
        toast.warning(message, { duration })
        break
      case 'error':
        toast.error(message, { duration })
        break
      default:
        toast(message, { duration })
    }
  }

  return {
    toast: showToast,
    success: (message: string) => showToast(message, 'success'),
    warning: (message: string) => showToast(message, 'warning'),
    error: (message: string) => showToast(message, 'error'),
    info: (message: string) => showToast(message, 'default'),
    // Méthodes pour notifications plus complexes
    promise: toast.promise,
    custom: toast.custom,
    dismiss: toast.dismiss,
  }
}