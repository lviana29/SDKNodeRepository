export interface AggregateOptionsInterface {
  where?: object;
  include?: any[];
  groupBy?: string | string[];
  order?: Array<[string, "ASC" | "DESC"]>;
  metrics: Array<{
    function: "COUNT" | "AVG" | "SUM" | "MIN" | "MAX" | "TIMESTAMPDIFF_MINUTE" | "DATE" | "HOUR";
    field: string;
    alias: string;
  }>;
}