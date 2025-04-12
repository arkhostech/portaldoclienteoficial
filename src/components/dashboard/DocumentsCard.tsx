
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Document } from "@/services/documents/types";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface DocumentsCardProps {
  documents: Document[];
}

const DocumentsCard = ({ documents }: DocumentsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.slice(0, 5).map((doc) => (
              <div key={doc.id} className="flex justify-between items-center p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Visualizar</Button>
              </div>
            ))}
            
            {documents.length > 5 && (
              <div className="text-center pt-2">
                <Link to="/documents">
                  <Button variant="link">Ver todos os documentos</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Nenhum documento disponível no momento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsCard;
