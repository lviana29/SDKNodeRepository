export interface AggregateOptionsInterface {
  where?: object;
  include?: any[];
  metrics: Array<{
    function: "COUNT" | "AVG" | "SUM" | "MIN" | "MAX";
    field: string;
    alias: string;
  }>;
}