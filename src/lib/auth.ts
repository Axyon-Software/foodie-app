// src/lib/auth.ts
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getServerSession() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return { user };
}

export async function requireAuth() {
    const session = await getServerSession();
    if (!session) {
        redirect('/sign-in');
    }
    return session;
}