
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MessageCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Count initial unread messages
    const fetchUnreadCount = async () => {
      try {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('is_read', false)
          .eq('sender_type', 'admin')
          .in('conversation_id', 
            supabase
              .from('conversations')
              .select('id')
              .eq('client_id', user.id)
          );
        
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error counting unread messages:', error);
      }
    };
    
    fetchUnreadCount();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('messages_for_client')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_type=eq.admin`
        },
        (payload) => {
          // Only count messages from admin to this client
          supabase
            .from('conversations')
            .select('client_id')
            .eq('id', payload.new.conversation_id)
            .single()
            .then(({ data }) => {
              if (data && data.client_id === user.id) {
                setUnreadCount(prev => prev + 1);
              }
            });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const handleOpenChat = () => {
    navigate('/messages');
    setUnreadCount(0); // Reset counter when opening messages
  };
  
  if (!user) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        size="lg" 
        className="rounded-full w-14 h-14 shadow-lg relative"
        onClick={handleOpenChat}
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 px-2 rounded-full">
            {unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};
