
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDocuments } from "@/hooks/documents/useDocuments";
import { useToast } from "@/components/ui/use-toast";
import { fetchClientById } from "@/services/clients";
import { Client } from "@/services/clients/types";

import { ClientDocumentsHeader } from "@/components/admin/documents/ClientDocumentsHeader";
import { ClientDocumentsContent } from "@/components/admin/documents/ClientDocumentsContent";
import DocumentUploadDialog from "@/components/admin/documents/DocumentUploadDialog";
import DocumentEditDialog from "@/components/admin/documents/DocumentEditDialog";
import DocumentDeleteDialog from "@/components/admin/documents/DocumentDeleteDialog";
import { Document as DocumentType } from "@/services/documents/types";

export default function ClientDocuments() {
  const { clientId = "" } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [isClientLoading, setIsClientLoading] = useState(true);
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
  }, [clientId, toast]);

  // Functions to handle document actions
  const handleDirectEdit = (document: DocumentType) => {
    handleEditDocument(document);
  };

  const handleDirectDelete = (document: DocumentType) => {
    handleConfirmDelete(document);
  };

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
        <ClientDocumentsHeader 
          client={client} 
          isLoading={isClientLoading} 
          pageTitle={pageTitle} 
        />

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
            <ClientDocumentsContent
              documents={documents}
              isLoading={isLoading}
              isClientLoading={isClientLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              client={client}
              clientId={clientId}
              setOpenUploadDialog={setOpenUploadDialog}
              onDownload={handleDirectDownload}
              onEdit={handleDirectEdit}
              onDelete={handleDirectDelete}
            />
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
