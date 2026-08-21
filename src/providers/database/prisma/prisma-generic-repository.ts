import { AggregateOptionsInterface } from "../../../interfaces/aggregate-options-interface";
import { IGenericRepository } from "../../../interfaces/generic-repository-interface";

export class PrismaGenericRepository<
  TEntity,
> implements IGenericRepository<TEntity> {
  constructor(
    private prismaClient: any,
    private modelName: string,
  ) {}

  

  async aggregate<TResult = Record<string, any>>(
    options: AggregateOptionsInterface
  ): Promise<TResult[]> {
    
    if (options.groupBy) {
      
      const byFields = Array.isArray(options.groupBy)
        ? options.groupBy
        : [options.groupBy];

    
      const selectAggregates: Record<string, any> = {};

      for (const metric of options.metrics) {
        if (["COUNT", "SUM", "AVG", "MIN", "MAX"].includes(metric.function)) {
          const prismaFunc = `_${metric.function.toLowerCase()}`;
          if (!selectAggregates[prismaFunc]) {
            selectAggregates[prismaFunc] = {};
          }
          selectAggregates[prismaFunc][metric.field] = true;
        }
      }

     
      const groupResults = await this.dbModel.groupBy({
        by: byFields,
        where: options.where,
        ...selectAggregates,
        ...(options.order && { orderBy: options.order }),
      });

   
      return groupResults.map((item: any) => {
        const formattedItem: Record<string, any> = {};

        for (const field of byFields) {
          formattedItem[field] = item[field];
        }

        for (const metric of options.metrics) {
          const prismaFunc = `_${metric.function.toLowerCase()}`;
          const rawValue = item[prismaFunc]?.[metric.field];
          formattedItem[metric.alias] =
            typeof rawValue === "number" ? rawValue : Number(rawValue || 0);
        }

        return formattedItem as TResult;
      });
    }

    const aggregatePayload: Record<string, any> = {};

    for (const metric of options.metrics) {
      if (["COUNT", "SUM", "AVG", "MIN", "MAX"].includes(metric.function)) {
        const prismaFunction = `_${metric.function.toLowerCase()}`;
        if (!aggregatePayload[prismaFunction]) {
          aggregatePayload[prismaFunction] = {};
        }
        aggregatePayload[prismaFunction][metric.field] = true;
      }
    }

    const result = await this.dbModel.aggregate({
      where: options.where,
      ...aggregatePayload,
    });

    const formattedResult: Record<string, any> = {};

    for (const metric of options.metrics) {
      const prismaFunction = `_${metric.function.toLowerCase()}`;
      const rawValue = result[prismaFunction]?.[metric.field];
      formattedResult[metric.alias] =
        typeof rawValue === "number" ? rawValue : Number(rawValue || 0);
    }

    return [formattedResult as TResult];
  }

  private get dbModel() {
    return this.prismaClient[this.modelName.toLowerCase()];
  }

  async findById(id: string | number, raw = true): Promise<TEntity | null> {
    const parsedId =
      typeof id === "string" && !isNaN(Number(id)) ? Number(id) : id;

    const record = await this.dbModel.findUnique({
      where: { id: parsedId },
    });

    return record as TEntity | null;
  }

  private getClient(options?: { transaction?: any }) {
    return options?.transaction || this.prismaClient;
  }

  async create(data: Partial<TEntity>, options?: { transaction?: any }): Promise<TEntity> {
    const client = this.getClient(options);
    const record = await client[this.modelName.toLowerCase()].create({ data });
    return record as TEntity;
  }

  async update(id: string | number, data: Partial<TEntity>, options?: { transaction?: any }): Promise<TEntity> {
    const parsedId =
      typeof id === "string" && !isNaN(Number(id)) ? Number(id) : id;
    const client = options?.transaction || this.prismaClient;
    const record = await client[this.modelName.toLowerCase()].update({
    where: { id: parsedId },
    data: data,
  });
    return record as TEntity;
  }

  async findCustom<TData = TEntity>(
    queryName: string,
    options?: any,
    raw = true
  ): Promise<TData[]> {
    const result = await this.dbModel.findMany({
      ...options,
    });

    return result as unknown as TData[];
  }

  async updateMany(where: object, data: Partial<TEntity>, options?: { transaction?: any }): Promise<number> {
    const client = options?.transaction || this.prismaClient;
    const result = await client[this.modelName.toLowerCase()].updateMany({
      where: where,
      data: data,
    });

    return result.count;
  }

  async deleteMany(where: any, options?: { transaction?: any }): Promise<number> {
  const client = options?.transaction || this.prismaClient;
  const result = await client[this.modelName.toLowerCase()].deleteMany({
    where,
    ...(options?.transaction && { })
  });
  
  return result.count;
}

  async createMany(data: Partial<TEntity>[], options?: { transaction?: any }): Promise<number> {
    const client = options?.transaction || this.prismaClient;
    
    const result = await client[this.modelName.toLowerCase()].createMany({
      data: data,
      skipDuplicates: true,
    });

    return result.count;
  }

  async clear(): Promise<void> {
    await this.dbModel.deleteMany({});
  }

  async delete(id: string | number): Promise<void> {
    typeof id === "string" && !isNaN(Number(id)) ? Number(id) : id;

    await this.dbModel.delete({
      where: { id },
    });
  }
}
