
import { ToastProps } from "./types"
import { useToastStore } from "./toast-context"
import { genId } from "./toast-utils"

export function toast(props: ToastProps) {
  const id = genId()
  const { dispatch } = useToastStore()
  
  const dismiss = () => dispatch({
    type: "DISMISS_TOAST",
    toastId: id,
  })

  dispatch({
    type: "ADD_TOAST",
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
        type: "UPDATE_TOAST",
        toast: {
          id,
          ...props,
        },
      })
    }
  }
}

export function useToast() {
  const store = useToastStore()
  return {
    ...store,
    toast,
    dismiss: (toastId?: string) => {
      store.dispatch({ type: "DISMISS_TOAST", toastId })
    },
  }
}
