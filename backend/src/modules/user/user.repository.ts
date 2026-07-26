import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

interface FindUsersParams {
  page: any;
  limit: any;
  search?: string | undefined;
  role?: prismaClientModule.Role | undefined;
  status?: prismaClientModule.UserStatus | undefined;
  base?: string | undefined;
  sortBy?: "name" | "email" | "role" | "status" | "createdAt" | undefined;
  sortOrder?: "asc" | "desc" | undefined;
  baseCommanderFilter?: string | undefined;
}

class UserRepository {
  public async createUser(data: prismaClientModule.Prisma.UserUncheckedCreateInput): Promise<prismaClientModule.User> {
    return prisma.user.create({ data });
  }

  public async findUserById(id: string): Promise<prismaClientModule.User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async findUserByEmail(email: string): Promise<prismaClientModule.User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  public async countActiveAdmins(): Promise<number> {
    return prisma.user.count({
      where: {
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
  }

  public async findUsers({
    page,
    limit,
    search,
    role,
    status,
    base,
    sortBy = "createdAt",
    sortOrder = "desc",
    baseCommanderFilter,
  }: FindUsersParams): Promise<{ users: prismaClientModule.User[]; total: number }> {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const where: prismaClientModule.Prisma.UserWhereInput = {};

    if (baseCommanderFilter !== undefined) {
      where.baseId = baseCommanderFilter;
      where.role = {
        not: "ADMIN",
      };
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }
    if (base) {
      where.baseId = base;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parsedLimit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  public async updateUser(id: string, data: prismaClientModule.Prisma.UserUncheckedUpdateInput): Promise<prismaClientModule.User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export = UserRepository;
