import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";
import { 
  SupabaseProvider, 
  SupabaseProviderMeta,
  SupabaseUserGlobalContext,
  SupabaseUserGlobalContextMeta,
  SupabaseUppyUploader,
  SupabaseUppyUploaderMeta,
  SupabaseStorageGetSignedUrl,
  SupabaseStorageGetSignedUrlMeta,
} from "plasmic-supabase"
import { TweetsProvider } from "./components/TweetsProvider";
import { SimpleSupabase } from "./components/SimpleSupabase";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "uq7px5X4x7CRdCwt4RJJuL",
      token: "Z8FrRr2HaMKbP8KibepvYdAtwYWwskXWjJ2N7vbSMgcOevsJPhlWcaA8UnrB7hrZ6xXApU8LqhueaCzcf1g",
    },
  ],

  preview: true,
});

//Register global context
PLASMIC.registerGlobalContext(SupabaseUserGlobalContext, SupabaseUserGlobalContextMeta)

//Register components
PLASMIC.registerComponent(SupabaseProvider, SupabaseProviderMeta);
PLASMIC.registerComponent(SupabaseUppyUploader, SupabaseUppyUploaderMeta);
PLASMIC.registerComponent(SupabaseStorageGetSignedUrl, SupabaseStorageGetSignedUrlMeta);

PLASMIC.registerComponent(TweetsProvider, {
  name: "TweetsProvider",
  providesData: true,
  props: {
    children: "slot"
  }
})

PLASMIC.registerComponent(SimpleSupabase, {
  name: "SimpleSupabase",
  providesData: true,
  props: {
    children: "slot",
    queryName: 'string'
  },
  refActions: {
    addRow: {
      description: 'Add a row',
      argTypes: [
        {name: 'rowForSupabase', type: 'object'},
        {name: 'optimisticRow', type: 'object'}
      ]
    }
  }
})
