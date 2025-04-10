
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Upload } from "lucide-react";
import { fetchClientById } from "@/services/clientService";
import { useClientDocuments } from "@/hooks/useClientDocuments";
import { useAuth } from "@/contexts/AuthContext";
import DocumentsTable from "@/components/admin/documents/DocumentsTable";
import DocumentUploadDialog from "@/components/admin/documents/DocumentUploadDialog";
import DocumentEditDialog from "@/components/admin/documents/DocumentEditDialog";
import DocumentDeleteDialog from "@/components/admin/documents/DocumentDeleteDialog";

const ClientDocuments = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientLoading, setClientLoading] = useState(true);
  
  const {
    documents,
    selectedDocument,
    isLoading,
    isUploading,
    isUpdating,
    isDeleting,
    openUploadDialog,
    openEditDialog,
    openDeleteDialog,
    setOpenUploadDialog,
    setOpenEditDialog,
    setOpenDeleteDialog,
    handleUploadDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    handleDownloadDocument,
    handleEditDocument,
    handleConfirmDelete,
  } = useClientDocuments(clientId || "");

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin || !clientId) {
      navigate("/admin/clients");
      return;
    }

    loadClientData();
  }, [isAdmin, clientId, navigate]);

  const loadClientData = async () => {
    if (!clientId) return;
    
    setClientLoading(true);
    const clientData = await fetchClientById(clientId);
    
    if (clientData) {
      setClient(clientData);
    } else {
      navigate("/admin/clients");
    }
    
    setClientLoading(false);
  };

  return (
    <MainLayout title={`Documentos - ${client?.full_name || ""}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/clients")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold">Documentos do Cliente</h2>
            {client && (
              <p className="text-muted-foreground">
                {client.full_name} - {client.email}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documento..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setOpenUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Enviar Documento
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lista de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentsTable
              documents={documents}
              isLoading={isLoading || clientLoading}
              searchTerm={searchTerm}
              onDownload={handleDownloadDocument}
              onEdit={handleEditDocument}
              onDelete={handleConfirmDelete}
            />
          </CardContent>
        </Card>
      </div>

      {/* Upload Document Dialog */}
      <DocumentUploadDialog
        open={openUploadDialog}
        onOpenChange={setOpenUploadDialog}
        onUpload={handleUploadDocument}
        isUploading={isUploading}
      />

      {/* Edit Document Dialog */}
      <DocumentEditDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        document={selectedDocument}
        onSave={handleUpdateDocument}
        isUpdating={isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <DocumentDeleteDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        document={selectedDocument}
        onConfirmDelete={handleDeleteDocument}
        isDeleting={isDeleting}
      />
    </MainLayout>
  );
};

export default ClientDocuments;
