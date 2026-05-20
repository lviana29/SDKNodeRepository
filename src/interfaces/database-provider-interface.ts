import { IGenericRepository } from "./generic-repository-interface";

export interface IDataBaseProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getRepository<TEntity>(modelName: string): IGenericRepository<TEntity>;
}
