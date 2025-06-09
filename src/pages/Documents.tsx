import { useState, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, Search, Upload, FileText, FolderOpen } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useClientData } from "@/hooks/useClientData";
import { toast } from "sonner";
import { fetchDocuments } from "@/services/documents";
import { ClientDocumentView } from "@/services/documents/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentCard } from "@/components/ui/document";
import DocumentUploadDialog from "@/components/admin/documents/DocumentUploadDialog";
import { uploadDocument, DocumentFormData } from "@/services/documents";
import { Client } from "@/services/clients/types";

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<ClientDocumentView[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { clientData } = useClientData();
  
  useEffect(() => {
    const loadDocuments = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log("Fetching documents for user ID:", user.id);
        
        const documentsData = await fetchDocuments(user.id);
        
        if (documentsData && documentsData.length > 0) {
          console.log("Documents found:", documentsData.length);
          
          const clientDocuments: ClientDocumentView[] = documentsData.map(doc => ({
            id: doc.id,
            name: doc.title,
            type: doc.file_type || 'Unknown',
            category: doc.description || 'General',
            uploadedBy: doc.uploaded_by === 'client' ? 'Cliente' : 'Admin',
            uploadDate: doc.created_at,
            size: doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Unknown',
            needsSignature: false,
            signed: false,
            filePath: doc.file_path
          }));
          
          setDocuments(clientDocuments);
          
          const uniqueCategories = [...new Set(clientDocuments.map(doc => doc.category))];
          setCategories(uniqueCategories);
        } else {
          console.log("No documents found for user ID:", user.id);
          setDocuments([]);
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        toast.error("Erro ao carregar documentos");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocuments();
  }, [user]);
  
  const filteredDocuments = searchTerm 
    ? documents.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : documents;

  const handleUploadDocument = async (data: DocumentFormData & { file: File }) => {
    if (!clientData) {
      toast.error("Dados do cliente não encontrados");
      return false;
    }

    setIsSubmitting(true);
    
    try {
      const result = await uploadDocument(clientData.id, data.file, {
        title: data.title || data.file.name,
        description: data.description,
        client_id: clientData.id
      }, 'client');

      if (result) {
        toast.success("Documento enviado com sucesso!");
        setOpenUploadDialog(false);
        
        // Recarregar a lista de documentos
        const documentsData = await fetchDocuments(user!.id);
        if (documentsData && documentsData.length > 0) {
          const clientDocuments: ClientDocumentView[] = documentsData.map(doc => ({
            id: doc.id,
            name: doc.title,
            type: doc.file_type || 'Unknown',
            category: doc.description || 'General',
            uploadedBy: doc.uploaded_by === 'client' ? 'Cliente' : 'Admin',
            uploadDate: doc.created_at,
            size: doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Unknown',
            needsSignature: false,
            signed: false,
            filePath: doc.file_path
          }));
          
          setDocuments(clientDocuments);
        }
        
        return true;
      } else {
        toast.error("Falha no upload do documento");
        return false;
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar documento");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalDocuments = documents.length;
  const documentsFromAdmin = documents.filter(doc => doc.uploadedBy === 'Admin').length;
  const documentsFromClient = documents.filter(doc => doc.uploadedBy === 'Cliente').length;

  return (
    <MainLayout title="Documentos">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#000000]">Documentos</h1>
            <p className="text-[#6b7280]">
              Gerencie e visualize seus documentos.
            </p>
          </div>
          <div>
            <Button 
              onClick={() => setOpenUploadDialog(true)}
              className="w-full md:w-auto bg-[#1e3a8a] hover:bg-[#1e40af] text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Upload className="mr-2 h-4 w-4" />
              Enviar Documentos
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border border-[#f3f4f6] shadow-sm hover:shadow-md hover:border-[#93c5fd] transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#dbeafe] rounded-lg">
                    <FileText className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#000000]">{totalDocuments}</p>
                    <p className="text-sm text-[#6b7280]">Total de Documentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#f3f4f6] shadow-sm hover:shadow-md hover:border-[#93c5fd] transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#dbeafe] rounded-lg">
                    <FolderOpen className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#000000]">{documentsFromAdmin}</p>
                    <p className="text-sm text-[#6b7280]">Do Escritório</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#f3f4f6] shadow-sm hover:shadow-md hover:border-[#93c5fd] transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#dbeafe] rounded-lg">
                    <Upload className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#000000]">{documentsFromClient}</p>
                    <p className="text-sm text-[#6b7280]">Seus Envios</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Card className="bg-white border border-[#f3f4f6] shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
                <Input 
                  placeholder="Buscar documentos..." 
                  className="pl-10 border-[#e5e7eb] focus:border-[#3b82f6] focus:ring-[#3b82f6] transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-[#f3f4f6]">
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : documents.length > 0 ? (
              <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="bg-[#f3f4f6] border border-[#e5e7eb]">
                    <TabsTrigger 
                      value="all" 
                      className="data-[state=active]:bg-white data-[state=active]:text-[#1e3a8a] data-[state=active]:border-[#3b82f6] text-[#6b7280]"
                    >
                      Todos ({filteredDocuments.length})
                    </TabsTrigger>
                    {categories.map(category => (
                      <TabsTrigger 
                        key={category} 
                        value={category}
                        className="data-[state=active]:bg-white data-[state=active]:text-[#1e3a8a] data-[state=active]:border-[#3b82f6] text-[#6b7280]"
                      >
                        {category} ({filteredDocuments.filter(doc => doc.category === category).length})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map(doc => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                </TabsContent>
                
                {categories.map(category => (
                  <TabsContent key={category} value={category} className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDocuments
                        .filter(doc => doc.category === category)
                        .map(doc => (
                          <DocumentCard key={doc.id} document={doc} />
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto w-16 h-16 bg-[#f3f4f6] rounded-full flex items-center justify-center mb-4">
                  <FilePlus className="h-8 w-8 text-[#6b7280]" />
                </div>
                <h3 className="text-lg font-medium text-[#000000] mb-2">Nenhum documento disponível</h3>
                <p className="text-[#6b7280] mb-4">Não existem documentos associados a sua conta.</p>
                <Button 
                  onClick={() => setOpenUploadDialog(true)}
                  className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar Primeiro Documento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <DocumentUploadDialog
          open={openUploadDialog}
          onOpenChange={setOpenUploadDialog}
          onUpload={handleUploadDocument}
          isSubmitting={isSubmitting}
          clients={clientData ? [{
            id: clientData.id,
            full_name: clientData.full_name,
            email: clientData.email,
            phone: clientData.phone,
            status: clientData.status,
            process_type_id: clientData.process_type_id,
            created_at: clientData.created_at,
            updated_at: clientData.updated_at
          } as Client] : []}
          preSelectedClientId={clientData?.id}
        />
      </div>
    </MainLayout>
  );
};

export default Documents;
