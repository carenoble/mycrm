declare module 'jsonwebtoken' {
  export interface SignOptions {
    expiresIn?: string | number;
    [key: string]: any;
  }

  export interface VerifyOptions {
    [key: string]: any;
  }

  export function sign(
    payload: string | object | Buffer,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: VerifyOptions
  ): any;

  export function decode(token: string): any;
}