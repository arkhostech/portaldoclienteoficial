import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, Eye, EyeOff, Key } from "lucide-react";
import { Client, ClientFormData } from "@/services/clientService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { processStatusOptions, processTypes } from "./schemas/clientSchema";

const clientFormSchema = z.object({
  full_name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.string(),
  process_type: z.string().optional()
});

const passwordResetSchema = z.object({
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "Confirme a senha" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

interface EditClientModalProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: ClientFormData) => Promise<boolean>;
  onResetPassword?: (id: string, password: string) => Promise<boolean>;
  isSubmitting: boolean;
}

const EditClientModal = ({
  client,
  open,
  onOpenChange,
  onSubmit,
  onResetPassword,
  isSubmitting
}: EditClientModalProps) => {
  const [activeTab, setActiveTab] = useState<"edit" | "password">("edit");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
      process_type: ""
    }
  });

  const passwordForm = useForm<{ password: string, confirmPassword: string }>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (client) {
      form.reset({
        full_name: client.full_name,
        email: client.email,
        phone: client.phone || "",
        address: client.address || "",
        status: client.status,
        process_type: client.process_type || ""
      });
    }
  }, [client, form]);
  
  const handleSubmit = async (data: ClientFormData) => {
    if (!client) return;
    
    try {
      const success = await onSubmit(client.id, data);
      
      if (success) {
        setTimeout(() => {
          onOpenChange(false);
          form.reset();
        }, 300);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handlePasswordReset = async (data: { password: string, confirmPassword: string }) => {
    if (!client || !onResetPassword) return;
    
    try {
      const success = await onResetPassword(client.id, data.password);
      
      if (success) {
        passwordForm.reset();
        setActiveTab("edit");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isSubmitting && open === false) {
      onOpenChange(open);
      if (!open) {
        setTimeout(() => {
          form.reset();
          passwordForm.reset();
          setActiveTab("edit");
        }, 100);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize os dados do cliente
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "password")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Dados do Cliente</TabsTrigger>
            <TabsTrigger value="password" disabled={!onResetPassword}>
              Resetar Senha
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo*</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome Completo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email*</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="email@exemplo.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(XX) XXXXX-XXXX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Endereço completo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="process_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Processo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de processo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {processTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status do Processo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {processStatusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleDialogClose(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Atualizar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="password">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
              <p className="text-sm text-amber-800 flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Ao redefinir a senha, o cliente precisará usar a nova senha para acessar o portal.
              </p>
            </div>
            
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordReset)} className="space-y-4">
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
                            onClick={togglePasswordVisibility}
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
                            onClick={toggleConfirmPasswordVisibility}
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
                    onClick={() => setActiveTab("edit")}
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientModal;
