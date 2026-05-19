import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE } as any);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET as string);
  } catch (error) {
    return null;
  }
};
