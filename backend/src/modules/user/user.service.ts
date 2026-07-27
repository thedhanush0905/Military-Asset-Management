import bcrypt = require("bcrypt");
import env = require("../../config/env.js");
import UserRepository = require("./user.repository.js");
import prisma = require("../../shared/prisma/prisma.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import AuditService = require("../../shared/services/audit.service.js");
import NotificationService = require("../../shared/services/notification.service.js");

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: prismaClientModule.Role;
  status: prismaClientModule.UserStatus;
  baseId: string | null;
}

interface PaginatedUsers {
  users: SafeUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class UserService {
  private readonly userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  private sanitizeUser(user: prismaClientModule.User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      baseId: user.baseId,
    };
  }

  public async createUser(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<SafeUser> {
    const existing = await this.userRepository.findUserByEmail(data.email);
    if (existing) {
      throw new ValidationError("Email already in use");
    }

    let finalBaseId = data.baseId;
    if (data.role === "ADMIN") {
      finalBaseId = null;
    } else {
      if (!finalBaseId) {
        throw new ValidationError("Base assignment is required for this role");
      }
      const baseExists = await prisma.base.findUnique({
        where: { id: finalBaseId },
      });
      if (!baseExists) {
        throw new ValidationError("Base does not exist");
      }
    }

    const saltRounds = env.BCRYPT_SALT_ROUNDS ? parseInt(env.BCRYPT_SALT_ROUNDS, 10) : 12;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const created = await this.userRepository.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      baseId: finalBaseId,
      status: "ACTIVE",
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "USER",
      action: "USER_CREATE",
      entityType: "User",
      entityId: created.id,
      newValues: { name: created.name, email: created.email, role: created.role, baseId: created.baseId },
    });

    await NotificationService.createNotification({
      userId: null,
      title: "New User Registered",
      message: `User ${created.name} (${created.role}) has been created by ${currentUser.name}.`,
      type: "SYSTEM",
      priority: "MEDIUM",
    });

    return this.sanitizeUser(created);
  }

  public async findUserById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<SafeUser> {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (currentUser.role === "BASE_COMMANDER") {
      if (user.baseId !== currentUser.baseId || user.role === "ADMIN") {
        throw new ForbiddenError("Access Denied");
      }
    }

    return this.sanitizeUser(user);
  }

  public async findUsers(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<PaginatedUsers> {
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    
    let baseCommanderFilter: string | undefined;

    if (currentUser.role === "BASE_COMMANDER") {
      if (!currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Commander not assigned to a base");
      }
      baseCommanderFilter = currentUser.baseId;
    }

    const { users, total } = await this.userRepository.findUsers({
      page,
      limit,
      search: queryParams.search,
      role: queryParams.role,
      status: queryParams.status,
      base: queryParams.base,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
      baseCommanderFilter,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(u => this.sanitizeUser(u)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }

  public async updateUser(
    currentUser: prismaClientModule.User,
    id: string,
    data: any
  ): Promise<SafeUser> {
    const targetUser = await this.userRepository.findUserById(id);
    if (!targetUser) {
      throw new NotFoundError("User not found");
    }

    if (data.email && data.email !== targetUser.email) {
      const emailCollision = await this.userRepository.findUserByEmail(data.email);
      if (emailCollision) {
        throw new ValidationError("Email already in use");
      }
    }

    const willBecomeInactive = data.status && data.status !== "ACTIVE" && targetUser.status === "ACTIVE";
    if (id === currentUser.id && willBecomeInactive) {
      throw new ValidationError("Action forbidden: Cannot deactivate or delete yourself");
    }

    const targetIsAdmin = targetUser.role === "ADMIN" && targetUser.status === "ACTIVE";
    const roleIsChanging = data.role && data.role !== "ADMIN";
    const statusIsChanging = data.status && data.status !== "ACTIVE";
    
    if (targetIsAdmin && (roleIsChanging || statusIsChanging)) {
      const activeAdminsCount = await this.userRepository.countActiveAdmins();
      if (activeAdminsCount <= 1) {
        throw new ValidationError("Cannot revoke privileges from the last active administrator");
      }
    }

    const updatedData: prismaClientModule.Prisma.UserUncheckedUpdateInput = { ...data };
    const targetRole = data.role || targetUser.role;

    if (targetRole === "ADMIN") {
      updatedData.baseId = null;
    } else {
      const baseIdToValidate = data.baseId !== undefined ? data.baseId : targetUser.baseId;
      if (!baseIdToValidate) {
        throw new ValidationError("Base assignment is required for this role");
      }
      const baseExists = await prisma.base.findUnique({
        where: { id: baseIdToValidate },
      });
      if (!baseExists) {
        throw new ValidationError("Base does not exist");
      }
    }

    const updated = await this.userRepository.updateUser(id, updatedData);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "USER",
      action: "USER_UPDATE",
      entityType: "User",
      entityId: updated.id,
      oldValues: { name: targetUser.name, email: targetUser.email, role: targetUser.role, baseId: targetUser.baseId, status: targetUser.status },
      newValues: { name: updated.name, email: updated.email, role: updated.role, baseId: updated.baseId, status: updated.status },
    });

    await NotificationService.createNotification({
      userId: updated.id,
      title: "Profile Updated",
      message: `Your user details have been updated by ${currentUser.name}.`,
      type: "SYSTEM",
      priority: "LOW",
    });

    return this.sanitizeUser(updated);
  }

  public async deactivateUser(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<SafeUser> {
    const targetUser = await this.userRepository.findUserById(id);
    if (!targetUser) {
      throw new NotFoundError("User not found");
    }

    if (id === currentUser.id) {
      throw new ValidationError("Action forbidden: Cannot deactivate or delete yourself");
    }

    if (targetUser.role === "ADMIN" && targetUser.status === "ACTIVE") {
      const activeAdminsCount = await this.userRepository.countActiveAdmins();
      if (activeAdminsCount <= 1) {
        throw new ValidationError("Cannot revoke privileges from the last active administrator");
      }
    }

    const updated = await this.userRepository.updateUser(id, {
      status: "DEACTIVATED",
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "USER",
      action: "USER_DEACTIVATE",
      entityType: "User",
      entityId: updated.id,
      oldValues: { status: targetUser.status },
      newValues: { status: "DEACTIVATED" },
    });

    await NotificationService.createNotification({
      userId: updated.id,
      title: "Account Deactivated",
      message: "Your account privilege has been deactivated.",
      type: "SYSTEM",
      priority: "HIGH",
    });

    return this.sanitizeUser(updated);
  }
}

export = UserService;
