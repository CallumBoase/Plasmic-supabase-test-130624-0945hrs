import { usePlasmicQueryData } from "@plasmicapp/loader-nextjs";
import { useMutablePlasmicQueryData } from "@plasmicapp/query";
import { DataProvider } from "@plasmicapp/loader-nextjs";

export function TweetsProvider({ children }: { children: React.ReactNode }) {
  const { data } = useMutablePlasmicQueryData('/tweets', async () => {
    const resp = await fetch('https://studio.plasmic.app/api/v1/demodata/tweets');
    return await resp.json();
  });

  return (
    <>
      {data && (
        <DataProvider name="tweets" data={data}>
          {children}
        </DataProvider>
      )}
    </>
  );
}