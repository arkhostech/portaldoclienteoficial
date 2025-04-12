
// Implementation of toast hooks 
// This file should NOT import from src/components/ui/use-toast.ts to avoid circular dependencies

import * as React from "react"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000 // Using 5 seconds instead of 1000000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  duration?: number
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
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

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        }
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        ),
      }
    }

    case actionTypes.REMOVE_TOAST: {
      const { toastId } = action

      if (toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      }
    }

    default:
      return state
  }
}

type ToastProps = Omit<ToasterToast, "id">

function toast(props: ToastProps) {
  const id = genId()

  const dispatch = useToastStore((state) => state.dispatch)
  const dismiss = () => dispatch({
    type: actionTypes.DISMISS_TOAST,
    toastId: id,
  })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      id,
      ...props,
      open: true,
    },
  })

  return {
    id,
    dismiss,
    update: (props: ToastProps) => {
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: {
          id,
          ...props,
        },
      })
    }
  }
}

// Store
type ToastContext = {
  toasts: ToasterToast[]
  dispatch: React.Dispatch<Action>
}

const ToastContext = React.createContext<ToastContext | null>(null)

function useToastStore() {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useReducer(reducer, {
    toasts: [],
  })

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open && toast.duration !== Infinity) {
        const timeout = setTimeout(() => {
          dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toast.id })
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

function useToast() {
  const store = useToastStore()
  return {
    ...store,
    toast,
    dismiss: (toastId?: string) => {
      store.dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
    },
  }
}

export { toast, useToast, ToastProvider }
