import { IGenericRepository } from "./generic-repository-interface";

export interface IDataBaseProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getRepository<TEntity>(modelName: string): IGenericRepository<TEntity>;
  transaction<T>(work: (t: any) => Promise<T>): Promise<T>;
  queryRaw<T = any>(sql: string, replacements?: any): Promise<T>;
}
