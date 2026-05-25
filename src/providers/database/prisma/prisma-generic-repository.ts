import { IGenericRepository } from "../../../interfaces/generic-repository-interface";

export class PrismaGenericRepository<
  TEntity,
> implements IGenericRepository<TEntity> {
  constructor(
    private prismaClient: any,
    private modelName: string,
  ) {}

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
