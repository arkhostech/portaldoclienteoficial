
import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const FloatingChatButton = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Count initial unread messages
    const fetchUnreadCount = async () => {
      try {
        // First get the user's conversation IDs
        const { data: conversationsData } = await supabase
          .from('conversations')
          .select('id')
          .eq('client_id', user.id);
        
        if (!conversationsData || conversationsData.length === 0) {
          setUnreadCount(0);
          return;
        }
        
        // Use the conversation IDs to count unread messages
        const conversationIds = conversationsData.map(conv => conv.id);
        
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('is_read', false)
          .eq('sender_type', 'admin')
          .in('conversation_id', conversationIds);
        
        setUnreadCount(count || 0);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel('unread-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_type=eq.admin`,
      }, async () => {
        // Refresh count on new message
        fetchUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleClick = () => {
    navigate('/messages');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50 bg-primary p-3 rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
    >
      <MessageSquare className="h-6 w-6 text-primary-foreground" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[1.5rem] h-[1.5rem] flex items-center justify-center text-xs">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </button>
  );
};
