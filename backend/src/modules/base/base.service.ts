import BaseRepository = require("./base.repository.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import type baseTypes = require("./base.types.js");

class BaseService {
  private readonly baseRepository: BaseRepository;

  constructor() {
    this.baseRepository = new BaseRepository();
  }

  private sanitizeBase(base: any): baseTypes.BaseResponse {
    return {
      id: base.id,
      code: base.code,
      name: base.name,
      location: base.location,
      isActive: base.isActive,
      _count: base._count ? {
        users: base._count.users,
        inventories: base._count.inventories,
      } : undefined,
    };
  }

  public async createBase(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<baseTypes.BaseResponse> {
    const code = data.code.trim().toUpperCase();

    const existingCode = await this.baseRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictError("Base code already in use");
    }

    const name = data.name.trim();
    const location = data.location.trim();

    const existingCombination = await this.baseRepository.findActiveByNameAndLocation(name, location);
    if (existingCombination) {
      throw new ConflictError("An active base with this name and location combination already exists");
    }

    const created = await this.baseRepository.create({
      code,
      name,
      location,
      isActive: true,
    });

    return this.sanitizeBase(created);
  }

  public async getBases(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<baseTypes.PaginatedBases> {
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const sortBy = queryParams.sortBy ?? "createdAt";
    const sortOrder = queryParams.sortOrder ?? "desc";
    const search = queryParams.search ? queryParams.search.trim() : undefined;

    const where: prismaClientModule.Prisma.BaseWhereInput = {
      isActive: true,
    };

    if (currentUser.role === "BASE_COMMANDER") {
      if (!currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Commander not assigned to a base");
      }
      where.id = currentUser.baseId;
    }

    if (search) {
      where.OR = [
        {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          location: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const { bases, total } = await this.baseRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      bases: bases.map((b) => this.sanitizeBase(b)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }

  public async getBaseById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<baseTypes.BaseResponse> {
    if (currentUser.role === "BASE_COMMANDER") {
      if (id !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied");
      }
    }

    const base = await this.baseRepository.findActiveById(id);
    if (!base) {
      throw new NotFoundError("Base not found");
    }

    return this.sanitizeBase(base);
  }

  public async updateBase(
    currentUser: prismaClientModule.User,
    id: string,
    data: any
  ): Promise<baseTypes.BaseResponse> {
    const targetBase = await this.baseRepository.findById(id);
    if (!targetBase || !targetBase.isActive) {
      throw new NotFoundError("Base not found");
    }

    const updatePayload: any = {};

    if (data.code !== undefined) {
      const code = data.code.trim().toUpperCase();
      if (code !== targetBase.code) {
        const existingCode = await this.baseRepository.findByCode(code);
        if (existingCode) {
          throw new ConflictError("Base code already in use");
        }
      }
      updatePayload.code = code;
    }

    if (data.name !== undefined || data.location !== undefined) {
      const name = data.name !== undefined ? data.name.trim() : targetBase.name;
      const location = data.location !== undefined ? data.location.trim() : targetBase.location;

      if (name !== targetBase.name || location !== targetBase.location) {
        const existingCombination = await this.baseRepository.findActiveByNameAndLocation(name, location);
        if (existingCombination && existingCombination.id !== id) {
          throw new ConflictError("An active base with this name and location combination already exists");
        }
      }
      if (data.name !== undefined) updatePayload.name = name;
      if (data.location !== undefined) updatePayload.location = location;
    }

    const updated = await this.baseRepository.update(id, updatePayload);
    return this.sanitizeBase(updated);
  }

  public async deleteBase(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<baseTypes.BaseResponse> {
    const targetBase = await this.baseRepository.findById(id);
    if (!targetBase || !targetBase.isActive) {
      throw new NotFoundError("Base not found");
    }

    const usersCount = await this.baseRepository.countUsersByBaseId(id);
    const activeStockCount = await this.baseRepository.countActiveStockByBaseId(id);

    if (usersCount > 0 || activeStockCount > 0) {
      throw new ConflictError("Cannot delete base: base has active dependencies (users or inventory)");
    }

    const deleted = await this.baseRepository.softDelete(id);
    return this.sanitizeBase(deleted);
  }
}

export = BaseService;
