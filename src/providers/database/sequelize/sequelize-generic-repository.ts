import { col, fn, literal, Model } from "sequelize";
import { IGenericRepository } from "../../../interfaces/generic-repository-interface";
import { AggregateOptionsInterface } from "../../../interfaces/aggregate-options-interface";

export class SequelizeGenericRepository<
  TEntity,
> implements IGenericRepository<TEntity> {
  constructor(private sequelizeModel: any) {}

  async aggregate<TResult = Record<string, any>>(
    options: AggregateOptionsInterface
  ): Promise<TResult[]> {
      const attributes: any[] = options.metrics.map((m) => {
      
      if (m.function === "TIMESTAMPDIFF_MINUTE") {
        const [startCol, endCol] = m.field.split(",");
        return [
          fn("AVG", literal(`TIMESTAMPDIFF(MINUTE, ${startCol}, ${endCol})`)),
          m.alias,
        ];
      }

      if (m.function === "DATE") {
        return [fn("DATE", col(m.field)), m.alias];
      }

      if (m.function === "HOUR") {
          return [fn("HOUR", col(m.field)), m.alias];
        }

        return [fn(m.function, col(m.field)), m.alias];

      });

    // Mapeia o groupBy para Sequelize literal caso venha uma função SQL
    const group = options.groupBy
      ? Array.isArray(options.groupBy)
        ? options.groupBy.map((g) => literal(g))
        : [literal(options.groupBy)]
      : undefined;

    const result = await this.sequelizeModel.findAll({
      attributes,
      where: options.where,
      include: options.include,
      group,
      order: options.order,
      raw: true,
    });

    return (result || []) as TResult[];
  }

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

  async deleteMany(where: object, options?: { transaction?: any }): Promise<number> {
    return await this.sequelizeModel.destroy({
    where,
    transaction: options?.transaction
  });
  }

  async createMany(data: Partial<TEntity>[], options?: { transaction?: any }): Promise<TEntity[]> {
   
    const records = await this.sequelizeModel.bulkCreate(data, { 
      transaction: options?.transaction 
    });
    
    return records.map((r: Model) => r.toJSON()) as TEntity[];
  }

  async clear(): Promise<void> {
    await this.sequelizeModel.destroy({ where: {} });
  }

  async delete(id: string | number): Promise<void> {
    await this.sequelizeModel.destroy({ where: { id } });
  }
}
