
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Search, 
  MoreHorizontal, 
  Upload,
  Pencil, 
  Trash2,
  FileText,
  Download,
  X,
  Loader2,
  Clock
} from "lucide-react";
import { fetchClientById, Client } from "@/services/clientService";
import { 
  Document, 
  DocumentFormData,
  fetchClientDocuments, 
  uploadDocument, 
  updateDocumentMetadata,
  deleteDocument,
  getDocumentUrl
} from "@/services/documentService";

// Form validation schema for uploading documents
const documentFormSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  status: z.string().default("active"),
  file: z.instanceof(File, { message: "Arquivo é obrigatório" })
});

// Form validation schema for editing document metadata
const documentMetadataFormSchema = z.object({
  title: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  status: z.string().default("active")
});

const ClientDocuments = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // State for tracking operations - important for preventing UI locking
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Improved form hooks with proper reset handling
  const uploadForm = useForm<DocumentFormData & { file: File }>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "active"
    }
  });

  const editForm = useForm<Omit<DocumentFormData, 'client_id'>>({
    resolver: zodResolver(documentMetadataFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "active"
    }
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin || !clientId) {
      navigate("/admin/clients");
      return;
    }

    loadClientData();
  }, [isAdmin, clientId, navigate]);
  
  // Improved cleanup when dialogs close
  useEffect(() => {
    if (!openEditDialog) {
      setTimeout(() => {
        setIsUpdating(false);
      }, 100);
    }
  }, [openEditDialog]);
  
  useEffect(() => {
    if (!openDeleteDialog) {
      setTimeout(() => {
        setIsDeleting(false);
      }, 100);
    }
  }, [openDeleteDialog]);
  
  useEffect(() => {
    if (!openUploadDialog) {
      setTimeout(() => {
        setIsSubmitting(false);
        setSelectedFile(null);
        uploadForm.reset({
          title: "",
          description: "",
          status: "active"
        });
      }, 100);
    }
  }, [openUploadDialog]);

  const loadClientData = async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    const clientData = await fetchClientById(clientId);
    
    if (clientData) {
      setClient(clientData);
      const documentsData = await fetchClientDocuments(clientId);
      setDocuments(documentsData);
    } else {
      navigate("/admin/clients");
    }
    
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      uploadForm.setValue('file', e.target.files[0]);
    }
  };

  const handleUploadDocument = async (data: DocumentFormData & { file: File }) => {
    if (!clientId || !data.file) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare document data
      const documentData: DocumentFormData = {
        title: data.title,
        description: data.description,
        status: data.status,
        client_id: clientId
      };
      
      const result = await uploadDocument(clientId, data.file, documentData);
      
      if (result) {
        setDocuments(prevDocs => [result, ...prevDocs]);
        // Delay closing the dialog to prevent UI issues
        setTimeout(() => {
          setOpenUploadDialog(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Erro ao enviar documento");
    }
    
    // We don't reset isSubmitting here - it will be handled by the useEffect when dialog closes
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    editForm.reset({
      title: document.title,
      description: document.description || "",
      status: document.status
    });
    setOpenEditDialog(true);
  };

  const handleUpdateDocument = async (data: Omit<DocumentFormData, 'client_id'>) => {
    if (!selectedDocument) return;
    
    setIsUpdating(true);
    
    try {
      const result = await updateDocumentMetadata(selectedDocument.id, data);
      
      if (result) {
        setDocuments(prevDocs => prevDocs.map(doc => doc.id === result.id ? result : doc));
        // Delay closing the dialog to prevent UI issues
        setTimeout(() => {
          setOpenEditDialog(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Erro ao atualizar documento");
    }
    
    // We don't reset isUpdating here - it will be handled by the useEffect when dialog closes
  };

  const handleConfirmDelete = (document: Document) => {
    setSelectedDocument(document);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    setIsDeleting(true);
    
    try {
      const success = await deleteDocument(selectedDocument.id, selectedDocument.file_path);
      
      if (success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== selectedDocument.id));
        // Delay closing the dialog to prevent UI issues
        setTimeout(() => {
          setOpenDeleteDialog(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Erro ao excluir documento");
    }
    
    // We don't reset isDeleting here - it will be handled by the useEffect when dialog closes
  };

  const handleDownloadDocument = async (document: Document) => {
    if (!document.file_path) {
      toast.error("Nenhum arquivo disponível para download");
      return;
    }
    
    const url = await getDocumentUrl(document.file_path);
    
    if (url) {
      // Open in a new tab to avoid navigation issues
      const win = window.open(url, '_blank');
      if (win) win.focus();
    }
  };

  // Improved dialog close handlers that prevent closing during operations
  const handleUploadDialogChange = (open: boolean) => {
    if (!isSubmitting) {
      setOpenUploadDialog(open);
    } else if (open) {
      setOpenUploadDialog(open);
    }
  };
  
  const handleEditDialogChange = (open: boolean) => {
    if (!isUpdating) {
      setOpenEditDialog(open);
    } else if (open) {
      setOpenEditDialog(open);
    }
  };
  
  const handleDeleteDialogChange = (open: boolean) => {
    if (!isDeleting) {
      setOpenDeleteDialog(open);
    } else if (open) {
      setOpenDeleteDialog(open);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <MainLayout title={`Documentos - ${client?.full_name || ''}`}>
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
          <Dialog open={openUploadDialog} onOpenChange={handleUploadDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Enviar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Enviar Novo Documento</DialogTitle>
                <DialogDescription>
                  Preencha os dados e anexe o arquivo para enviar
                </DialogDescription>
              </DialogHeader>
              <Form {...uploadForm}>
                <form onSubmit={uploadForm.handleSubmit(handleUploadDocument)} className="space-y-4">
                  <FormField
                    control={uploadForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título*</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Título do documento" disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={uploadForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Descrição do documento" disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={uploadForm.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arquivo*</FormLabel>
                        <FormControl>
                          <div className="grid w-full max-w-md items-center gap-1.5">
                            <Input
                              id="file-upload"
                              type="file"
                              onChange={handleFileChange} 
                              disabled={isSubmitting}
                            />
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
                      onClick={() => {
                        if (!isSubmitting) {
                          setOpenUploadDialog(false);
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Enviar
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lista de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Nenhum documento encontrado para a busca." : "Nenhum documento cadastrado."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate max-w-[200px]" title={doc.title}>
                            {doc.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{doc.file_type || "N/A"}</TableCell>
                      <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          {formatDate(doc.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          doc.status === "active" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {doc.status === "active" ? "Ativo" : "Inativo"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {doc.file_path && (
                              <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleEditDocument(doc)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleConfirmDelete(doc)} 
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Document Dialog */}
      <Dialog open={openEditDialog} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Documento</DialogTitle>
            <DialogDescription>
              Atualize as informações do documento
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateDocument)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Título do documento" disabled={isUpdating} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Descrição do documento" disabled={isUpdating} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background"
                        {...field}
                        disabled={isUpdating}
                      >
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    if (!isUpdating) {
                      setOpenEditDialog(false);
                    }
                  }}
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Atualizar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={handleDeleteDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o documento
              {selectedDocument && ` "${selectedDocument.title}"`}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                if (!isDeleting) {
                  setOpenDeleteDialog(false);
                }
              }}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteDocument}
              disabled={isDeleting}
            >
              {isDeleting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ClientDocuments;
