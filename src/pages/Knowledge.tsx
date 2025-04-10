
import { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { knowledgeArticles } from "@/utils/dummyData";
import { BookOpen, FileText, Search, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Knowledge = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const categories = [...new Set(knowledgeArticles.map((article) => article.category))];
  
  const filteredArticles = searchTerm
    ? knowledgeArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : knowledgeArticles;

  const getIcon = (category: string) => {
    switch (category) {
      case "Processos de Imigração":
        return <BookOpen className="h-10 w-10 text-brand-600" />;
      case "Documentação":
        return <FileText className="h-10 w-10 text-green-600" />;
      case "Procedimentos USCIS":
        return <Video className="h-10 w-10 text-blue-600" />;
      default:
        return <BookOpen className="h-10 w-10 text-gray-600" />;
    }
  };

  return (
    <MainLayout title="Base de Conhecimento">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-2">Base de Conhecimento</h1>
          <p className="text-muted-foreground">
            Encontre informações úteis sobre seu processo imigratório, documentos necessários e orientações gerais.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na base de conhecimento..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tab navigation */}
        <Tabs defaultValue="all">
          <TabsList className="justify-center">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-0">
                    <div className="flex justify-between">
                      <div className="mb-2">{getIcon(article.category)}</div>
                      <Badge variant="outline">{article.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription>{article.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a 
                      href={article.url} 
                      className="text-brand-600 hover:underline text-sm font-medium"
                    >
                      Ler artigo completo →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {filteredArticles
                  .filter((article) => article.category === category)
                  .map((article) => (
                    <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-0">
                        <div className="flex justify-between">
                          <div className="mb-2">{getIcon(article.category)}</div>
                          <Badge variant="outline">{article.category}</Badge>
                        </div>
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <CardDescription>{article.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <a 
                          href={article.url} 
                          className="text-brand-600 hover:underline text-sm font-medium"
                        >
                          Ler artigo completo →
                        </a>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* FAQ section */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-xl text-center">Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Quanto tempo demora o processo de EB-2 NIW?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                O tempo de processamento para EB-2 NIW varia, mas geralmente leva entre 8 e 14 meses para aprovação inicial, e mais tempo se houver RFEs ou para ajuste de status.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Quais são os documentos mais importantes para meu caso?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Depende do tipo de caso, mas geralmente incluem comprovantes de qualificação profissional, histórico acadêmico, cartas de recomendação e evidências de contribuição significativa em sua área.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Como responder a um RFE (Request for Evidence)?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                É crucial responder completamente a todos os pontos levantados pelo USCIS, fornecer documentação adicional conforme solicitado, e seguir rigorosamente os prazos. Seu advogado irá orientar especificamente para seu caso.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Knowledge;
