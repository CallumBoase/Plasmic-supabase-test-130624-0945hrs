import { useMutablePlasmicQueryData } from "@plasmicapp/query";
import { DataProvider } from "@plasmicapp/loader-nextjs";

import { createBrowserClient } from "@supabase/ssr";
import { forwardRef, useCallback, useImperativeHandle } from "react";
import { RunningCodeInNewContextOptions } from "vm";

interface Actions {
  addRow(rowForSupabase: any, optimisticRow: any): void;
}

type Row = {
  [key: string]: any;
};

type Rows = Row[] | null;

interface SimpleSupabaseProps {
  children: React.ReactNode;
  queryName: string;
  className?: string;
}

//An unrealistically simplified createClient without ref to cookies or local storage
const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const SimpleSupabase = forwardRef<Actions, SimpleSupabaseProps>(
  function SimpleSupabase(props, ref) {
    const { children, queryName, className } = props;
    const { data, mutate } = useMutablePlasmicQueryData(queryName, async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("test_pub").select("*");
      //random num between 1 and 10
      // const randomNum = Math.floor(Math.random() * 10) + 1;
      //simulate delay
      await new Promise((resolve) => setTimeout(resolve, 3000));
      if (error) throw error;
      return data;
    });

    const addRowOptimistically = useCallback(
      (data: Rows | null, optimisticRow: Row) => {
        const newData = [...(data || []), optimisticRow];
        return newData;
      },
      []
    );

    const addRow = useCallback(
      async (
        rowForSupabase: Row,
        optimisticRow: Row,
        optimisticFunc: (data: Rows, optimisticData: any) => Rows
      ) => {

        //Add the row to supabase
        const supabase = createClient();
        const { error } = await supabase.from('test_pub').insert(rowForSupabase);
        if (error) throw error;
        //@ts-ignore
        return optimisticFunc(data, optimisticRow);
      },
      [data]
    );

    //Function that just returns the data unchanged
    //To pass in as an optimistic update function when no optimistic update is desired
    //Effectively disabling optimistic updates for the operation
    function returnUnchangedData(data: Rows) {
      return data;
    }

    //Helper function to choose the correct optimistic data function to run
    function chooseOptimisticFunc(
      optimisticOperation: string | null | undefined,
      elementActionName: string
    ) {
      if (optimisticOperation === "addRow") {
        return addRowOptimistically;
      // } else if (optimisticOperation === "editRow") {
      //   return editRowOptimistically;
      // } else if (optimisticOperation === "deleteRow") {
      //   return deleteRowOptimistically;
      // } else if (optimisticOperation === "replaceData") {
      //   return replaceDataOptimistically;
      } else {
        //None of the above, but something was specified
        if (optimisticOperation) {
          throw new Error(`
              Invalid optimistic operation specified in "${elementActionName}" element action.
              You specified  "${optimisticOperation}" but the allowed values are "addRow", "editRow", "deleteRow", "replaceData" or left blank for no optimistic operation.
          `);
        }

        //Nothing specified, function that does not change data (ie no optimistic operation)
        return returnUnchangedData;
      }
    }

    useImperativeHandle(ref, () => ({
      //Element action to add a row with optional optimistic update & auto-refetch when done
      addRow: async (rowForSupabase, optimisticRow) => {
        
        //Choose the optimistic function based on whether the user has specified optimisticRow
        //No optimisticRow means the returnUnchangedData func will be used, disabling optimistic update
        let optimisticOperation = optimisticRow ? "addRow" : null;
        const optimisticFunc = chooseOptimisticFunc(
          optimisticOperation,
          "Add Row"
        );

        //Run the mutation
        //@ts-ignore
        mutate(addRow(rowForSupabase, optimisticRow, optimisticFunc), {
          populateCache: true,
          //@ts-ignore
          optimisticData: optimisticFunc(data, optimisticRow),
        }).catch((err) => console.error(err));
      },
    }));

    return (
      <>
        {data && (
          <div className={className}>
            <DataProvider name={queryName} data={data}>
              {children}
            </DataProvider>
          </div>
        )}
      </>
    );
  }
);
