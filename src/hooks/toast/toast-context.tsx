
import * as React from "react"
import { ToastContextType, State } from "./types"
import { reducer, TOAST_LIMIT } from "./toast-reducer"

// Create the context with appropriate type
export const ToastContext = React.createContext<ToastContextType | null>(null)

// Constants
export const TOAST_REMOVE_DELAY = 5000 // Using 5 seconds instead of 1000000
export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, {
    toasts: [],
  })

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open && toast.duration !== Infinity) {
        const timeout = setTimeout(() => {
          dispatch({ 
            type: "DISMISS_TOAST", 
            toastId: toast.id 
          })
        }, toast.duration || TOAST_REMOVE_DELAY)

        toastTimeouts.set(toast.id, timeout)
      }
    })

    return () => {
      toastTimeouts.forEach((timeout) => clearTimeout(timeout))
      toastTimeouts.clear()
    }
  }, [state.toasts])

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, dispatch }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToastStore(): ToastContextType {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}
