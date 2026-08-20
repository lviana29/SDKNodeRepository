export interface AggregateOptionsInterface {
  where?: object;
  include?: any[];
  metrics: Array<{
    function: "COUNT" | "AVG" | "SUM" | "MIN" | "MAX" | "TIMESTAMPDIFF_MINUTE";
    field: string;
    alias: string;
  }>;
}