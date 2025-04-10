
import { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import DocumentsTable from "@/components/admin/documents/DocumentsTable";
import { useDocuments } from "@/hooks/documents/useDocuments";
import DocumentUploadDialog from "@/components/admin/documents/DocumentUploadDialog";
import DocumentEditDialog from "@/components/admin/documents/DocumentEditDialog";
import DocumentDeleteDialog from "@/components/admin/documents/DocumentDeleteDialog";
import { useClients } from "@/hooks/useClients";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Document as DocumentType } from "@/services/documents/types";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
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
    loadDocuments,
  } = useDocuments(selectedClientId);

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
      toast.error("Erro ao baixar o documento");
    }
  };

  return (
    <MainLayout title="Documentos">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Documentos</h1>
          <Button onClick={() => setOpenUploadDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar documento
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gerenciar documentos</CardTitle>
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
              <div className="w-full md:w-72">
                <Select
                  value={selectedClientId || "all"}
                  onValueChange={(value) => setSelectedClientId(value === "all" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os clientes</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DocumentsTable
              documents={documents}
              isLoading={isLoading || isClientsLoading}
              searchTerm={searchTerm}
              clients={clients}
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
        clients={clients}
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
