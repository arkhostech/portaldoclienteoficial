import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const emailFormSchema = z.object({
  email: z.string().email("Email inválido"),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme a nova senha"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const nameFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres")
});

type EmailFormValues = z.infer<typeof emailFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type NameFormValues = z.infer<typeof nameFormSchema>;

const AccountTab = () => {
  const [isEmailUpdating, setIsEmailUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [isNameUpdating, setIsNameUpdating] = useState(false);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "admin@example.com",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const nameForm = useForm<NameFormValues>({
    resolver: zodResolver(nameFormSchema),
    defaultValues: {
      name: "Administrador"
    }
  });

  const onEmailSubmit = async (data: EmailFormValues) => {
    setIsEmailUpdating(true);
    try {
      // Here would go the actual API call
      console.log("Email update data:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Email atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar email");
      console.error(error);
    } finally {
      setIsEmailUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsPasswordUpdating(true);
    try {
      // Here would go the actual API call
      console.log("Password update data:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Senha atualizada com sucesso");
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Erro ao atualizar senha");
      console.error(error);
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  const onNameSubmit = async (data: NameFormValues) => {
    setIsNameUpdating(true);
    try {
      // Simular API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Nome atualizado com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar nome");
      console.error(error);
    } finally {
      setIsNameUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Card para Editar Nome */}
      <Card style={{ 
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent style={{ padding: '24px' }}>
          <h3 
            className="text-xl font-semibold mb-6" 
            style={{ color: '#14140F' }}
          >
            Editar Nome da Conta
          </h3>
          <Form {...nameForm}>
            <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4">
              <FormField
                control={nameForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem style={{ marginBottom: '16px' }}>
                    <FormLabel 
                      style={{ 
                        color: '#14140F', 
                        fontWeight: 600 
                      }}
                    >
                      Nome
                    </FormLabel>
                    <div className="relative">
                      <User 
                        className="absolute left-3 top-3 h-4 w-4" 
                        style={{ color: '#34675C' }}
                      />
                      <FormControl>
                        <Input 
                          placeholder="Seu nome completo" 
                          className="pl-10 focus:border-[#053D38] max-w-md" 
                          style={{
                            borderColor: '#e5e7eb',
                          }}
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isNameUpdating}
                style={{
                  backgroundColor: '#053D38',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: 'none',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#042d2a';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#053D38';
                }}
                className="hover:opacity-90"
              >
                {isNameUpdating ? "Salvando..." : "Salvar Nome"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      {/* Card para Alterar Email */}
      <Card style={{ 
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent style={{ padding: '24px' }}>
          <h3 
            className="text-xl font-semibold mb-6" 
            style={{ color: '#14140F' }}
          >
            Alterar Email
          </h3>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem style={{ marginBottom: '16px' }}>
                    <FormLabel 
                      style={{ 
                        color: '#14140F', 
                        fontWeight: 600 
                      }}
                    >
                      Email
                    </FormLabel>
                    <div className="relative">
                      <Mail 
                        className="absolute left-3 top-3 h-4 w-4" 
                        style={{ color: '#34675C' }}
                      />
                      <FormControl>
                        <Input 
                          placeholder="seu@email.com" 
                          className="pl-10 focus:border-[#053D38] max-w-md" 
                          style={{
                            borderColor: '#e5e7eb',
                          }}
                          {...field} 
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isEmailUpdating}
                style={{
                  backgroundColor: '#053D38',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: 'none',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#042d2a';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#053D38';
                }}
                className="hover:opacity-90"
              >
                {isEmailUpdating ? "Salvando..." : "Atualizar Email"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountTab;
