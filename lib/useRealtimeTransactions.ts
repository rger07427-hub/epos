import { useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeTransactions(
  branchId: string | undefined,
  onNewTransaction: () => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!branchId) return;

    channelRef.current = supabase
      .channel(`transactions-${branchId}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `branch_id=eq.${branchId}`,
        },
        () => {
          onNewTransaction();
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [branchId]);
}
