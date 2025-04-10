
import { toast } from "sonner";

// Helper for creating consistent delayed toasts
export const createDelayedToast = (
  type: "success" | "error", 
  message: string, 
  delay: number = 300
) => {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      if (type === "success") {
        toast.success(message);
      } else {
        toast.error(message);
      }
      resolve();
    }, delay);
  });
};
