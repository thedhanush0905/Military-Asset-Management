import bcrypt = require("bcrypt");
import jwt = require("jsonwebtoken");
import env = require("../../config/env.js");
import AuthRepository = require("./auth.repository.js");
import UnauthorizedError = require("../../shared/errors/UnauthorizedError.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import AuditService = require("../../shared/services/audit.service.js");

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: prismaClientModule.Role;
  status: prismaClientModule.UserStatus;
  baseId: string | null;
}

class AuthService {
  private readonly authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  public async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ token: string; user: SafeUser }> {
    let user;
    try {
      user = await this.authRepository.findUserByEmail(email);

      if (!user || user.status !== "ACTIVE") {
        throw new UnauthorizedError("Invalid credentials");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedError("Invalid credentials");
      }
    } catch (error) {
      await AuditService.logAction({
        userId: user ? user.id : null,
        performedByType: "USER",
        module: "AUTH",
        action: "FAILED_LOGIN",
        entityType: "User",
        entityId: user ? user.id : "unknown",
        result: "FAILURE",
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        newValues: { email },
      });
      throw error;
    }

    await AuditService.logAction({
      userId: user.id,
      performedByType: "USER",
      module: "AUTH",
      action: "USER_LOGIN",
      entityType: "User",
      entityId: user.id,
      result: "SUCCESS",
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    const payload = {
      sub: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "12h" });

    const userPayload: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      baseId: user.baseId,
    };

    return {
      token,
      user: userPayload,
    };
  }
}

export = AuthService;
