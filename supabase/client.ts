import { Database } from '../database.types';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () =>
  createPagesBrowserClient<Database>();
