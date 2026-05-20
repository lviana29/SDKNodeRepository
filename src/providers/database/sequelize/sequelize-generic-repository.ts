import { IGenericRepository } from "../../../interfaces/generic-repository-interface";

export class SequelizeGenericRepository<
  TEntity,
> implements IGenericRepository<TEntity> {
  constructor(private sequelizeModel: any) {}

  async findById(id: string | number): Promise<TEntity | null> {
    const record = await this.sequelizeModel.findByPk(id);
    return record ? (record.toJSON() as TEntity as TEntity) : null;
  }

  async create(data: Partial<TEntity>): Promise<TEntity> {
    const record = await this.sequelizeModel.create(data);
    return record.toJSON() as TEntity;
  }

  async update(id: string | number, data: Partial<TEntity>): Promise<TEntity> {
    const record = await this.sequelizeModel.findByPk(id);
    if (!record) throw new Error("Not found");
    await record.update(data);
    return record.toJSON() as TEntity;
  }

  async findCustom<TData = TEntity>(
    queryName: string,
    options?: any,
  ): Promise<TData[]> {
    const result = await this.sequelizeModel.findAll({
      ...options,
      raw: true,
      nest: true,
    });

    return result as unknown as TData[];
  }

  async clear(): Promise<void> {
    await this.sequelizeModel.destroy({ where: {} });
  }

  async delete(id: string | number): Promise<void> {
    await this.sequelizeModel.delete({ where: { id } });
  }
}
