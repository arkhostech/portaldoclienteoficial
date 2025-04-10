
import { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import DocumentCard from "@/components/ui/DocumentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { documents } from "@/utils/dummyData";
import { FilePlus, FolderPlus, Search, Upload } from "lucide-react";

const Documents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const categories = [...new Set(documents.map(doc => doc.category))];
  
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
              Novo Documento
            </Button>
          </div>
        </div>
        
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
      </div>
    </MainLayout>
  );
};

export default Documents;
