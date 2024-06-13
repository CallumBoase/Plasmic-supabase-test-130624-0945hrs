import { useMutablePlasmicQueryData } from "@plasmicapp/query";
import { DataProvider } from "@plasmicapp/loader-nextjs";

import {createBrowserClient as createClient} from '@supabase/ssr'

export function SimpleSupabase({ children, queryName }: { children: React.ReactNode, queryName: string }) {
  const { data } = useMutablePlasmicQueryData(queryName, async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase.from('test_pub').select('*');
    //random num between 1 and 10
    const randomNum = Math.floor(Math.random() * 10) + 1;
    //simulate delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    if(error) throw error;
    return data[randomNum];
  });

  return (
    <>
      {data && (
        <DataProvider name={queryName} data={data}>
          {children}
        </DataProvider>
      )}
    </>
  );
}