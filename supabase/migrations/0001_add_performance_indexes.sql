-- Migration para otimizar performance do sistema de chat
-- Adiciona índices para queries frequentes de mensagens não lidas

-- **ÍNDICE 1: Otimizar contagem de mensagens não lidas por conversa**
-- Usado nas queries: conversation_id + sender_type + is_read
CREATE INDEX IF NOT EXISTS idx_messages_unread_by_conversation 
ON messages (conversation_id, sender_type, is_read) 
WHERE is_read IS FALSE OR is_read IS NULL;

-- **ÍNDICE 2: Otimizar queries de mensagens por sender_type**
-- Usado para contar mensagens de clientes não lidas (admin notifications)
CREATE INDEX IF NOT EXISTS idx_messages_sender_type_unread 
ON messages (sender_type, is_read) 
WHERE is_read IS FALSE OR is_read IS NULL;

-- **ÍNDICE 3: Otimizar queries por conversation_id + created_at**
-- Usado para pagination e busca de mensagens por conversa
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at 
ON messages (conversation_id, created_at DESC);

-- **ÍNDICE 4: Otimizar updates em batch por IDs**
-- Usado para batch updates de is_read
CREATE INDEX IF NOT EXISTS idx_messages_id_unread 
ON messages (id) 
WHERE is_read IS FALSE OR is_read IS NULL;

-- **ÍNDICE 5: Otimizar queries de conversas por client_id**
-- Usado para buscar conversas de um cliente específico
CREATE INDEX IF NOT EXISTS idx_conversations_client_id 
ON conversations (client_id);

-- **ÍNDICE 6: Otimizar ordenação de conversas por updated_at**
-- Usado para listar conversas mais recentes primeiro
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
ON conversations (updated_at DESC);

-- Adicionar comentários para documentar o propósito
COMMENT ON INDEX idx_messages_unread_by_conversation IS 'Otimiza contagem de mensagens não lidas por conversa';
COMMENT ON INDEX idx_messages_sender_type_unread IS 'Otimiza queries de notificações para admin';
COMMENT ON INDEX idx_messages_conversation_created_at IS 'Otimiza pagination de mensagens';
COMMENT ON INDEX idx_messages_id_unread IS 'Otimiza batch updates de mensagens como lidas';
COMMENT ON INDEX idx_conversations_client_id IS 'Otimiza busca de conversas por cliente';
COMMENT ON INDEX idx_conversations_updated_at IS 'Otimiza ordenação de conversas recentes'; 