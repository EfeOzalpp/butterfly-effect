import * as React from "react";

import useGraphData from "./useGraphData";

type GraphDataState = ReturnType<typeof useGraphData>;

const GraphDataContext = React.createContext<GraphDataState | null>(null);

export function GraphDataProvider({
  data,
  children,
}: {
  data: unknown;
  children: React.ReactNode;
}) {
  const value = useGraphData(data);
  return <GraphDataContext.Provider value={value}>{children}</GraphDataContext.Provider>;
}

export function useSharedGraphData() {
  const ctx = React.useContext(GraphDataContext);
  if (!ctx) {
    throw new Error("useSharedGraphData must be used within GraphDataProvider");
  }
  return ctx;
}
