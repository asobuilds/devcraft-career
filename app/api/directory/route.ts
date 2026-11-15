import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('full_name, tech_stack, avatar_url, website')
      .eq('show_dev_portfolio', true);

    if (error) {
      throw error;
    }

    return NextResponse.json(profiles || []);
  } catch (err) {
    console.error('Error fetching directory profiles:', err as Error);
    return NextResponse.json({ error: (err as Error).message || 'Failed to fetch directory profiles' }, { status: 500 });
  }
}
