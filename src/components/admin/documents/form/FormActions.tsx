import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({ isSubmitting, onCancel }) => {
  return (
    <div className="flex justify-end gap-4 mt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="border border-[#e5e7eb] text-[#053D38] hover:bg-[#f0f9f4] rounded-lg px-6 py-3 font-semibold"
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="bg-[#053D38] hover:bg-[#34675C] text-white rounded-lg px-6 py-3 font-semibold transition-all duration-200"
      >
        {isSubmitting && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Enviar
      </Button>
    </div>
  );
};
