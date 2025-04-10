
import { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { messages } from "@/utils/dummyData";
import { PaperclipIcon, Send } from "lucide-react";

const Messages = () => {
  const [newMessage, setNewMessage] = useState("");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <MainLayout title="Mensagens">
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        <div className="mb-4">
          <h2 className="text-xl font-bold">Conversa com Escritório de Advocacia</h2>
          <p className="text-sm text-muted-foreground">
            Todas as mensagens são arquivadas para referência futura
          </p>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`max-w-3xl ${
                msg.sender === "Cliente"
                  ? "ml-auto bg-brand-50 border-brand-100"
                  : "mr-auto"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <span className={`font-medium ${
                    msg.sender === "Cliente" ? "text-brand-700" : "text-gray-700"
                  }`}>
                    {msg.sender}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(msg.timestamp)}
                  </span>
                </div>
                <p className="mt-2 text-sm">{msg.content}</p>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3">
                    {msg.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs mr-2 mt-2"
                      >
                        <PaperclipIcon className="h-3 w-3 mr-1" />
                        {attachment}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message input */}
        <div className="sticky bottom-0 bg-white pt-2">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="flex-shrink-0 flex space-x-2">
              <Button variant="outline" size="icon">
                <PaperclipIcon className="h-5 w-5" />
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
