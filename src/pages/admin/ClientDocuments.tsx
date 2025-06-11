import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDocuments } from "@/hooks/documents/useDocuments";
import { useClients } from "@/hooks/useClients";
import { ClientDocumentsContent } from "@/components/admin/documents/ClientDocumentsContent";
import DocumentUploadDialog from "@/components/admin/documents/DocumentUploadDialog";
import DocumentEditDialog from "@/components/admin/documents/DocumentEditDialog";
import DocumentDeleteDialog from "@/components/admin/documents/DocumentDeleteDialog";
import { Document as DocumentType } from "@/services/documents/types";

export default function ClientDocuments() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { clients, isLoading: isClientsLoading } = useClients();
  
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

  const client = clients.find(c => c.id === clientId);
  const clientName = client?.full_name || "Cliente desconhecido";

  const filteredDocuments = searchTerm
    ? documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : documents;

  const handleBackClick = () => {
    navigate("/admin/documents");
  };

  // Wrapper function to match the expected signature
  const handleDownload = async (document: DocumentType): Promise<void> => {
    await handleDownloadDocument(document);
  };

  return (
    <MainLayout title={`Documentos - ${clientName}`}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackClick}
            className="flex items-center gap-2 text-[#34675C] border-[#34675C] hover:bg-[#053D38] hover:text-white hover:border-[#053D38] transition-colors duration-200 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#14140F]" style={{ fontWeight: 700 }}>
              Documentos de {clientName}
            </h1>
            <p className="text-[#34675C] mt-1">
              Gerencie os documentos deste cliente.
            </p>
          </div>
        </div>

        <Card className="bg-white border border-[#e5e7eb] shadow-lg rounded-lg">
          <CardContent className="pt-6">
            <ClientDocumentsContent
              documents={filteredDocuments}
              isLoading={isLoading}
              isClientLoading={isClientsLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              client={client || null}
              clientId={clientId || ""}
              setOpenUploadDialog={setOpenUploadDialog}
              onDownload={handleDownload}
              onEdit={handleEditDocument}
              onDelete={handleConfirmDelete}
            />
          </CardContent>
        </Card>
      </div>

      <DocumentUploadDialog
        open={openUploadDialog}
        onOpenChange={setOpenUploadDialog}
        onUpload={handleUploadDocument}
        isSubmitting={isSubmitting}
        clients={clients}
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
