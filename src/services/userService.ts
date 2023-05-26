import { Prisma, PrismaClient, User, UserConfig } from '@prisma/client';

const prisma = new PrismaClient();

export const createUserWithConfig = async (
  userData: Prisma.UserCreateInput,
  userConfigData: Prisma.UserConfigCreateWithoutUserInput,
): Promise<{ user: User; userConfig: UserConfig }> => {
  const user = await prisma.user.create({
    data: userData,
  });

  const userConfig = await prisma.userConfig.create({
    data: {
      ...userConfigData,
      userId: user.id,
    },
  });

  return { user, userConfig };
};
