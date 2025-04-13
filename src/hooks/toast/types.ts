
import * as React from "react"

export type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  duration?: number
  variant?: "default" | "destructive"
}

export interface State {
  toasts: ToasterToast[]
}

export type ToastProps = Omit<ToasterToast, "id">

export type ToastActionElement = React.ReactElement<any> // Using any here as we don't have access to the original type

export type ToastContextType = {
  toasts: ToasterToast[]
  dispatch: React.Dispatch<Action>
}

export const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

export type ActionType = typeof actionTypes

export type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }
