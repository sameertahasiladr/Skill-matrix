import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { url } = request;

    // skip JWT auth global guard for these routes
    const skipRoutes = [
      '/auth/login',
      '/auth/set-password',
      '/auth/validate-reset-token',
      '/auth/reset-password/sending-email',
      '/user/create-user',
      '/tags',
      '/pdf/public/skills'
    ];

    // split is used since validate-reset-token url has token query
    const cleanUrl = url.split('?')[0];

    // split is used since validate-reset-token url has token query
    if (
      skipRoutes.includes(url) ||
      skipRoutes.includes(cleanUrl)
    ) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
