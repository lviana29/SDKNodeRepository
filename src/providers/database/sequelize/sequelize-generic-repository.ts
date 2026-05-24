import { IGenericRepository } from "../../../interfaces/generic-repository-interface";

export class SequelizeGenericRepository<
  TEntity,
> implements IGenericRepository<TEntity> {
  constructor(private sequelizeModel: any) {}

  async findById(id: string | number, raw = true): Promise<TEntity | null> {
    const record = await this.sequelizeModel.findByPk(id);
    if (!record) return null;
    
    return raw ? (record.get({ plain: true }) as TEntity) : (record as unknown as TEntity);
  }

  async create(data: Partial<TEntity>, options?: { transaction?: any }): Promise<TEntity> {
    const record = await this.sequelizeModel.create(data, { transaction: options?.transaction });
    return record.toJSON() as TEntity;
  }

  async update(id: string | number, data: Partial<TEntity>, options?: { transaction?: any }): Promise<TEntity> {
    const record = await this.sequelizeModel.findByPk(id, { transaction: options?.transaction });
    if (!record) throw new Error("Not found");
    await record.update(data, { transaction: options?.transaction });
    return record.toJSON() as TEntity;
  }

  async findCustom<TData = TEntity>(
    queryName: string,
    options?: any,
    raw = false,
  ): Promise<TData[]> {
    const result = await this.sequelizeModel.findAll({
      ...options,
      nest: true,
    });

    if (raw) {
      return result.map((r: any) => r.get({ plain: true })) as TData[];
    }

    return result as unknown as TData[];
  }

  async updateMany(where: object, data: Partial<TEntity>, options?: { transaction?: any }): Promise<number> {
  const [affectedRows] = await this.sequelizeModel.update(data, { 
    where, 
    transaction: options?.transaction 
  });
  return affectedRows;
}

  async clear(): Promise<void> {
    await this.sequelizeModel.destroy({ where: {} });
  }

  async delete(id: string | number): Promise<void> {
    await this.sequelizeModel.delete({ where: { id } });
  }
}
