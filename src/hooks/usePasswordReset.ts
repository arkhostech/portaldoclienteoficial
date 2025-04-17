
import { useState } from "react";
import { resetClientPassword } from "@/services/clients";
import { toast } from "sonner";

type UsePasswordResetProps = {
  onSuccess?: () => void;
};

export const usePasswordReset = ({ onSuccess }: UsePasswordResetProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPassword = async (clientId: string, password: string): Promise<boolean> => {
    setIsSubmitting(true);
    
    try {
      const success = await resetClientPassword(clientId, password);
      
      if (success) {
        if (onSuccess) onSuccess();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Erro ao redefinir senha do cliente");
      return false;
    } finally {
      // Delay state update to prevent UI issues
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
    }
  };

  return {
    resetPassword,
    isSubmitting
  };
};
