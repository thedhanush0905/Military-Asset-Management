import SystemConfigRepository = require("./system-config.repository.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class SystemConfigService {
  private readonly configRepository: SystemConfigRepository;

  constructor() {
    this.configRepository = new SystemConfigRepository();
  }

  public async getConfig(currentUser: prismaClientModule.User, key: string): Promise<prismaClientModule.SystemConfig> {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Administrators only");
    }

    const config = await this.configRepository.findByKey(key);
    if (!config) {
      throw new NotFoundError(`System configuration with key '${key}' not found`);
    }

    return config;
  }

  public async getAllConfigs(currentUser: prismaClientModule.User): Promise<prismaClientModule.SystemConfig[]> {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Administrators only");
    }

    return this.configRepository.findMany();
  }

  public async upsertConfig(
    currentUser: prismaClientModule.User,
    key: string,
    value: string,
    description?: string | null
  ): Promise<prismaClientModule.SystemConfig> {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Administrators only");
    }

    return this.configRepository.upsert(key, value, description);
  }

  public async deleteConfig(currentUser: prismaClientModule.User, key: string): Promise<prismaClientModule.SystemConfig> {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Administrators only");
    }

    const config = await this.configRepository.findByKey(key);
    if (!config) {
      throw new NotFoundError(`System configuration with key '${key}' not found`);
    }

    return this.configRepository.delete(key);
  }

  // Internal helper to retrieve settings without user-check constraints
  public async getInternalSetting(key: string, defaultValue: string): Promise<string> {
    const config = await this.configRepository.findByKey(key);
    return config ? config.value : defaultValue;
  }
}

export = SystemConfigService;
