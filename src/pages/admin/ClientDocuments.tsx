import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDocuments } from "@/hooks/documents/useDocuments";
import DocumentUploadDialog from "@/components/admin/documents/DocumentUploadDialog";
import DocumentEditDialog from "@/components/admin/documents/DocumentEditDialog";
import DocumentDeleteDialog from "@/components/admin/documents/DocumentDeleteDialog";
import { useClients } from "@/hooks/useClients";
import { Document as DocumentType } from "@/services/documents/types";
import { Input } from "@/components/ui/input";
import { Search, FilePlus, ArrowLeft, Download, Pencil, Trash, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

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
  } = useDocuments(clientId || null);

  const client = clients.find(c => c.id === clientId);

  // Filter documents based on search term
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isClientsLoading) {
    return (
      <MainLayout title="Carregando...">
        <div className="container mx-auto py-6">
          <div className="h-8 bg-muted animate-pulse rounded-md mb-4" />
          <div className="h-64 bg-muted animate-pulse rounded-md" />
        </div>
      </MainLayout>
    );
  }

  if (!client) {
    return (
      <MainLayout title="Cliente não encontrado">
        <div className="container mx-auto py-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Cliente não encontrado</h1>
          <Button onClick={() => navigate("/admin/documents")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Documentos
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Documentos - ${client.full_name}`}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/admin/documents")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{client.full_name}</h1>
                <div className="flex items-center gap-2">
                  {client.process_type && (
                    <Badge variant="secondary">{client.process_type}</Badge>
                  )}
                  <span className="text-muted-foreground text-sm">
                    {documents.length} documento{documents.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Button 
              onClick={() => setOpenUploadDialog(true)}
              className="w-full md:w-auto"
            >
              <FilePlus className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar documentos..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <FileText className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm mb-1 line-clamp-2" title={doc.title}>
                              {doc.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(doc.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditDocument(doc)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDownloadDocument(doc)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleConfirmDelete(doc)}
                          title="Excluir"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "Nenhum documento encontrado" : "Nenhum documento ainda"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 
                    "Não foram encontrados documentos correspondentes à sua pesquisa." : 
                    `Adicione o primeiro documento para ${client.full_name}.`
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={() => setOpenUploadDialog(true)}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Adicionar Documento
                  </Button>
                )}
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
