import * as React from "react";
import {
  PlasmicComponent,
  extractPlasmicQueryData,
  ComponentRenderData,
  PlasmicRootProvider,
} from "@plasmicapp/loader-nextjs";
import type { GetStaticPaths, GetStaticProps } from "next";

import Error from "next/error";
import { useRouter } from "next/router";
import { PLASMIC } from "@/plasmic-init";

export default function PlasmicLoaderPage(props: {
  plasmicData?: ComponentRenderData;
  queryCache?: Record<string, any>;
}) {
  const { plasmicData, queryCache } = props;
  const router = useRouter();

  React.useEffect(() => {
    // Capture the client-side HTML after initial render
    const clientHtml = document.documentElement.outerHTML;
    console.log('USE EFFECT')
    console.log(clientHtml)
    // if (typeof global.serverHtml !== 'undefined') {
    //   console.log('comparing html')
    //   // Compare the HTML strings
    //   if (global.serverHtml !== clientHtml) {
    //     console.error('Hydration Error: HTML mismatch detected');
    //     // console.log('Server HTML:', global.serverHtml);
    //     // console.log('Client HTML:', clientHtml);
    //   }
    // }
  }, []);

  if (!plasmicData || plasmicData.entryCompMetas.length === 0) {
    return <Error statusCode={404} />;
  }
  const pageMeta = plasmicData.entryCompMetas[0];
  return (
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      prefetchedQueryData={queryCache}
      pageRoute={pageMeta.path}
      pageParams={pageMeta.params}
      pageQuery={router.query}
    >
      <PlasmicComponent component={pageMeta.displayName} />
    </PlasmicRootProvider>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  console.log('getStaticProps running')
  const { catchall } = context.params ?? {};
  const plasmicPath = typeof catchall === 'string' ? catchall : Array.isArray(catchall) ? `/${catchall.join('/')}` : '/';
  const plasmicData = await PLASMIC.maybeFetchComponentData(plasmicPath);
  if (!plasmicData) {
    // non-Plasmic catch-all
    return { props: {} };
  }
  const pageMeta = plasmicData.entryCompMetas[0];
  // Cache the necessary data fetched for the page
  const queryCache = await extractPlasmicQueryData(
    <PlasmicRootProvider
      loader={PLASMIC}
      prefetchedData={plasmicData}
      pageRoute={pageMeta.path}
      pageParams={pageMeta.params}
    >
      <PlasmicComponent component={pageMeta.displayName} />
    </PlasmicRootProvider>
  );
  console.log(JSON.stringify(queryCache))
  // Use revalidate if you want incremental static regeneration
  return { props: { plasmicData, queryCache }, revalidate: 60 };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const pageModules = await PLASMIC.fetchPages();
  return {
    paths: pageModules.map((mod) => ({
      params: {
        catchall: mod.path.substring(1).split("/"),
      },
    })),
    fallback: "blocking",
  };
}
