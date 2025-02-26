import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/database.types';
import { cookies } from 'next/headers';

export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies });
