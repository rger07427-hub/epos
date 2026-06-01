import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Product, BranchStock } from '../types';

interface ProductState {
  products: Product[];
  loading: boolean;
  fetchProducts: (branchId: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,

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
}));
