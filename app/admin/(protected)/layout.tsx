'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        console.log('[admin layout] getUser result', { user, userError });

        if (userError || !user) {
          setError(userError?.message || "Not authenticated");
          router.push('/admin/login');
          return;
        }

        // Check if user is admin by querying admin_users table
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('[admin layout] admin_users lookup', { adminData, adminError });

        if (adminError || !adminData) {
          setError(adminError?.message || "Not an admin user");
          router.push('/admin/login');
          return;
        }

        setIsAuthorized(true);
        setError(null);
      } catch (error) {
        console.error('Auth check error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthorized(false);
        router.push('/admin/login');
      } else if (event === 'SIGNED_IN' && session) {
        // Re-check auth when signed in
        checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">Checking admin access...</div>
          {error ? (
            <div className="text-sm text-red-600">Error: {error}</div>
          ) : (
            <div className="text-sm text-gray-600">Redirecting to login</div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

