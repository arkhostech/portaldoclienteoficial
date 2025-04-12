
import { useState, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import DocumentCard from "@/components/ui/DocumentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePlus, FolderPlus, Search, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Document } from "@/utils/dummyData";
import { Skeleton } from "@/components/ui/skeleton";

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Fetch documents for the current client
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('client_id', user.id);
        
        if (error) {
          console.error("Error fetching documents:", error);
          return;
        }
        
        if (data && data.length > 0) {
          const formattedDocs = data.map(doc => ({
            id: doc.id,
            name: doc.title,
            type: doc.file_type || 'Unknown',
            category: doc.description || 'General',  // Using description as category for now
            uploadedBy: 'Admin',
            uploadDate: doc.created_at,
            size: doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : 'Unknown',
            needsSignature: false,
            signed: false
          }));
          
          setDocuments(formattedDocs);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(formattedDocs.map(doc => doc.category))];
          setCategories(uniqueCategories);
        } else {
          setDocuments([]);
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [user]);
  
  const filteredDocuments = searchTerm 
    ? documents.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : documents;

  return (
    <MainLayout title="Documentos">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar documentos..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Fazer Upload
            </Button>
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              Solicitar Documento
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : documents.length > 0 ? (
          <Tabs defaultValue="all">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="signatures">Requer Assinatura</TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <Button variant="ghost" size="sm">
                <FolderPlus className="mr-2 h-4 w-4" />
                Nova Pasta
              </Button>
            </div>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="signatures" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments
                  .filter(doc => doc.needsSignature && !doc.signed)
                  .map(doc => (
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
          <div className="text-center py-12 border rounded-lg">
            <FilePlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-1">Nenhum documento disponível</h3>
            <p className="text-muted-foreground">Não existem documentos associados a sua conta.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Documents;
