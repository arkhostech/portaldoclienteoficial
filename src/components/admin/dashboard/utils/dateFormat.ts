
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "dd 'de' MMMM", { locale: ptBR });
  } catch (error) {
    console.error("Date parsing error:", error);
    return "Data inválida";
  }
};
