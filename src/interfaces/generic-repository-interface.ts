export interface IGenericRepository<TEntity> {
  findById(id: string | number, raw?: boolean): Promise<TEntity | null>;
  create(data: Partial<TEntity>, options?: { transaction?: any }): Promise<TEntity>;
  update(id: string | number, data: Partial<TEntity>, options?: { transaction?: any }): Promise<TEntity>;
  /**
   * Make a custom search (with joins and etc)
   * @template TData Custom/complex object send for client.
   * @param queryName Query identifier or custom options for ORM.
   * @param options Filter parameters, including native ORM, pagination and etc.
   */
  findCustom<TData = TEntity>(
    queryName: string,
    options?: any,
    raw?: boolean
  ): Promise<TData[]>;

  clear(): Promise<void>;
  delete(id: string | number): Promise<void>;
  updateMany(where: object, data: Partial<TEntity>, options?: { transaction?: any }): Promise<number>;
  createMany(data: Partial<TEntity>[], options?: { transaction?: any }): Promise<any>;
}
