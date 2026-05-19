import prisma from '../config/database';

export const getUsers = async (filters: {
  role?: string;
}) => {
  const where: any = {};
  if (filters.role) where.role = filters.role;

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
};

export const updateUser = async (id: string, data: {
  name?: string;
  role?: string;
}) => {
  return await prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.role && { role: data.role as 'ADMIN' | 'MANAGER' | 'AGENT' }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
};

export const deleteUser = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
  });
};
