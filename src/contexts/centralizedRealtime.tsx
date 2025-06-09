import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export const CentralizedRealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();
  const mounted = useRef(true);
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());

  // Helper function para criar channels com cleanup automático
  const createChannel = (name: string, channelName: string) => {
    const existingChannel = channelsRef.current.get(name);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase.channel(channelName);
    channelsRef.current.set(name, channel);
    return channel;
  };

  useEffect(() => {
    mounted.current = true;

    if (!user) {
      // Cleanup all channels if no user
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
      return;
    }

    if (isAdmin) {
      // ===== ADMIN SUBSCRIPTIONS =====
      
      // 1. Conversações - inserção/atualização (para lista de conversas)
      const adminConversationsChannel = createChannel('admin-conversations', `admin_conversations_${user.id}`);
      adminConversationsChannel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations'
          },
          (payload) => {
            if (!mounted.current) return;
            
            window.dispatchEvent(new CustomEvent('admin-conversation-inserted', {
              detail: { conversation: payload.new }
            }));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations'
          },
          (payload) => {
            if (!mounted.current) return;
            
            window.dispatchEvent(new CustomEvent('admin-conversation-updated', {
              detail: { conversation: payload.new }
            }));
          }
        )
        .subscribe();

    } else {
      // ===== CLIENT SUBSCRIPTIONS =====
      
      // 1. Conversações do cliente usando filtro
      const clientConversationsChannel = createChannel('client-conversations', `client_conversations_${user.id}`);
      clientConversationsChannel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations',
            filter: `client_id=eq.${user.id}`
          },
          (payload) => {
            if (!mounted.current) return;
            
            window.dispatchEvent(new CustomEvent('client-conversation-inserted', {
              detail: { conversation: payload.new }
            }));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `client_id=eq.${user.id}`
          },
          (payload) => {
            if (!mounted.current) return;
            
            window.dispatchEvent(new CustomEvent('client-conversation-updated', {
              detail: { conversation: payload.new }
            }));
          }
        )
        .subscribe();
    }

    // Cleanup function
    return () => {
      mounted.current = false;
      
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
    };
  }, [user, isAdmin]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      channelsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
    };
  }, []);

  return <>{children}</>;
}; 