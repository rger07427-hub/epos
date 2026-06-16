import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ProductState {
  products: Product[];
  loading: boolean;
  channel: RealtimeChannel | null;
  fetchProducts: (branchId: string) => Promise<void>;
  subscribeRealtime: (branchId: string) => void;
  unsubscribeRealtime: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  channel: null,

  fetchProducts: async (branchId: string) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        branch_stocks!inner(stock)
      `)
      .eq('is_active', true)
      .eq('branch_stocks.branch_id', branchId)
      .order('name');

    if (!error && data) {
      const products = data.map((p: any) => ({
        ...p,
        stock: p.branch_stocks?.[0]?.stock ?? 0,
      }));
      set({ products });
    }
    set({ loading: false });
  },

  subscribeRealtime: (branchId: string) => {
    get().unsubscribeRealtime();

    const channel = supabase
      .channel(`products-${branchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'branch_stocks',
          filter: `branch_id=eq.${branchId}`,
        },
        async () => {
          await get().fetchProducts(branchId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        async () => {
          await get().fetchProducts(branchId);
        }
      )
      .subscribe();

    set({ channel });
  },

  unsubscribeRealtime: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
      set({ channel: null });
    }
  },
}));
