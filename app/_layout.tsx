import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  const { loadProfile } = useAuthStore();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadProfile();
        const profile = useAuthStore.getState().profile;
        if (profile?.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else if (profile?.role === 'kasir') {
          router.replace('/(kasir)/pos');
        }
      } else if (event === 'SIGNED_OUT') {
        router.replace('/(auth)/login');
      }
    });
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
