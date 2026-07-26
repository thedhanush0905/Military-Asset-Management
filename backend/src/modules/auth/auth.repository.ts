import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class AuthRepository {
  public async findUserByEmail(email: string): Promise<prismaClientModule.User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  public async findUserById(id: string): Promise<prismaClientModule.User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }
}

export = AuthRepository;
