// import jwt from 'jsonwebtoken';
// import { randomUUID } from 'crypto';
//
// interface RefreshTokenPayload {
//   userId: string;
//   deviceId: string;
//   iat: number;
//   exp: number;
// }
//
// export const jwtService = {
//   async createToken(userId: string): Promise<string> {
//     return jwt.sign({ userId }, 'createToken-for-me', {
//       expiresIn: 6000,
//     });
//   },
//   async createRefreshToken(userId: string, deviceId?: string): Promise<string> {
//     const payload = {
//       userId,
//       deviceId: deviceId ?? randomUUID(),
//       iat: Math.floor(Date.now() / 1000),
//     };
//     return jwt.sign(payload, 'createToken-for-me', {
//       expiresIn: 12000,
//     });
//   },
//   async decodeToken(token: string): Promise<any> {
//     try {
//       return jwt.decode(token);
//     } catch (e: unknown) {
//       console.error("Can't decode token", e);
//       return null;
//     }
//   },
//   async verifyToken(
//     token: string,
//   ): Promise<{ userId: string; deviceId?: string } | null> {
//     try {
//       return jwt.verify(token, 'createToken-for-me') as {
//         userId: string;
//         deviceId?: string;
//       };
//     } catch (error) {
//       console.error('Token verify some error');
//       return null;
//     }
//   },
// };
