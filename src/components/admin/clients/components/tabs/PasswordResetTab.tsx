
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Loader2, Key, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

const passwordResetSchema = z.object({
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "Confirme a senha" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordResetTabProps = {
  isSubmitting: boolean;
  onSubmit: (password: string) => Promise<void>;
  onBack: () => void;
};

export const PasswordResetTab = ({ isSubmitting, onSubmit, onBack }: PasswordResetTabProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordForm = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  const handleSubmit = async (data: { password: string; confirmPassword: string }) => {
    await onSubmit(data.password);
  };

  return (
    <>
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-sm text-amber-800 flex items-center">
          <Key className="h-4 w-4 mr-2" />
          Ao redefinir a senha, o cliente precisará usar a nova senha para acessar o portal.
        </p>
      </div>
      
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={passwordForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova Senha*</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Nova Senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Mínimo de 6 caracteres
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Nova Senha*</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirmar Nova Senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              disabled={isSubmitting}
            >
              Voltar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Redefinir Senha
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};
