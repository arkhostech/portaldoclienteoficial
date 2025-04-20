
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Phone, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const companyInfoSchema = z.object({
  companyName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  logo: z.any().optional(),
  contactEmail: z.string().email("Email de contato inválido"),
  contactPhone: z.string().min(10, "Telefone inválido"),
});

type CompanyInfoValues = z.infer<typeof companyInfoSchema>;

const CompanyInfoTab = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const form = useForm<CompanyInfoValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: "Legacy Imigra",
      contactEmail: "contato@legacyimigra.com",
      contactPhone: "(11) 99999-9999",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Set the file in the form
    form.setValue("logo", file);
  };

  const onSubmit = async (data: CompanyInfoValues) => {
    setIsUpdating(true);
    try {
      // Here would go the actual API call
      console.log("Company info update data:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Informações atualizadas com sucesso");
    } catch (error) {
      toast.error("Erro ao atualizar informações");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da sua empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Logo da Empresa</FormLabel>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/2">
                <div className="border rounded-md p-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    className="cursor-pointer"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Escolher Arquivo
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {form.watch("logo")?.name || "Nenhum arquivo selecionado"}
                  </span>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>

              <div className="w-full md:w-1/2 border rounded-md p-4 flex items-center justify-center bg-muted/30">
                {previewLogo ? (
                  <img
                    src={previewLogo}
                    alt="Logo preview"
                    className="max-h-24 max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p>Prévia da Logo</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de Contato</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="contato@empresa.com" className="pl-10" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone de Contato</FormLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" className="pl-10" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full sm:w-auto"
            disabled={isUpdating}
          >
            {isUpdating ? "Salvando..." : "Salvar Informações"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CompanyInfoTab;
