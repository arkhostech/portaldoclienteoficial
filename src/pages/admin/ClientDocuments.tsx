import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, FileText } from "lucide-react";
import { useDocuments } from "@/hooks/documents/useDocuments";
import DocumentsTable from "@/components/admin/documents/DocumentsTable";
import DocumentUploadDialog from "@/components/admin/documents/DocumentUploadDialog";
import DocumentEditDialog from "@/components/admin/documents/DocumentEditDialog";
import DocumentDeleteDialog from "@/components/admin/documents/DocumentDeleteDialog";
import { useToast } from "@/components/ui/use-toast";
import { fetchClientById } from "@/services/clients";
import { Client } from "@/services/clients/types";
import { Document as DocumentType } from "@/services/documents/types";

export default function ClientDocuments() {
  const { clientId = "" } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [isClientLoading, setIsClientLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const {
    documents,
    isLoading,
    selectedDocument,
    openUploadDialog,
    openEditDialog,
    openDeleteDialog,
    isSubmitting,
    isUpdating,
    isDeleting,
    setOpenUploadDialog,
    setOpenEditDialog,
    setOpenDeleteDialog,
    handleUploadDocument,
    handleEditDocument,
    handleUpdateDocument,
    handleConfirmDelete,
    handleDeleteDocument,
    handleDownloadDocument,
  } = useDocuments(clientId);

  // Fetch client data
  useEffect(() => {
    const loadClient = async () => {
      setIsClientLoading(true);
      try {
        const clientData = await fetchClientById(clientId);
        if (!clientData) {
          toast({
            title: "Cliente não encontrado",
            description: "O cliente solicitado não foi encontrado.",
            variant: "destructive"
          });
          navigate("/admin/clients");
          return;
        }
        setClient(clientData);
      } catch (error) {
        console.error("Error loading client:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar os dados do cliente.",
          variant: "destructive"
        });
      } finally {
        setIsClientLoading(false);
      }
    };

    loadClient();
  }, [clientId, navigate, toast]);

  const handleBackToClients = () => {
    navigate("/admin/clients");
  };

  // Function to handle document edit directly from the table
  const handleDirectEdit = (document: DocumentType) => {
    handleEditDocument(document);
  };

  // Function to handle document deletion directly from the table
  const handleDirectDelete = (document: DocumentType) => {
    handleConfirmDelete(document);
  };

  // Function to handle document download directly from the table
  const handleDirectDownload = async (document: DocumentType) => {
    try {
      await handleDownloadDocument(document);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Erro",
        description: "Falha ao baixar o documento.",
        variant: "destructive"
      });
    }
  };

  const pageTitle = client ? `Documentos de ${client.full_name}` : "Documentos do Cliente";

  return (
    <MainLayout title={pageTitle}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBackToClients}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            {client && (
              <div className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">Email:</span> {client.email} | 
                <span className="font-medium ml-2">Processo:</span> {client.process_type || "Não definido"} |
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${client.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                  {client.status === "active" ? "Ativo" : "Inativo"}
                </span>
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Documentos do Cliente</CardTitle>
              <Button onClick={() => setOpenUploadDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Documento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar documentos..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {isLoading || isClientLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : documents.length > 0 ? (
              <DocumentsTable
                documents={documents}
                isLoading={false}
                searchTerm={searchTerm}
                clients={client ? [client] : []}
                onDownload={handleDirectDownload}
                onEdit={handleDirectEdit}
                onDelete={handleDirectDelete}
                hideClientColumn
              />
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-1">Nenhum documento disponível</h3>
                <p className="text-muted-foreground">
                  Este cliente ainda não possui documentos associados.
                </p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => setOpenUploadDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Adicionar documento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <DocumentUploadDialog
        open={openUploadDialog}
        onOpenChange={setOpenUploadDialog}
        onUpload={handleUploadDocument}
        isSubmitting={isSubmitting}
        clients={client ? [client] : []}
        preSelectedClientId={clientId}
      />
      
      <DocumentEditDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        document={selectedDocument}
        onSave={handleUpdateDocument}
        isUpdating={isUpdating}
      />
      
      <DocumentDeleteDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        document={selectedDocument}
        onDelete={handleDeleteDocument}
        isDeleting={isDeleting}
      />
    </MainLayout>
  );
}
