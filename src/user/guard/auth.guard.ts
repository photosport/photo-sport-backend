import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwkToPem from 'jwk-to-pem';
import { Request } from 'express';
import 'dotenv/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwksUrl = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
  private pems: Record<string, string> = {};

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const decoded = jwt.decode(token, { complete: true });
      const kid = decoded?.header.kid;

      if (!this.pems[kid]) {
        await this.loadPems();
      }

      jwt.verify(token, this.pems[kid], { algorithms: ['RS256'] });
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async loadPems() {
    const response = await fetch(this.jwksUrl);
    const { keys } = await response.json();

    keys.forEach((key) => {
      const pem = jwkToPem(key);
      this.pems[key.kid] = pem;
    });
  }
}
