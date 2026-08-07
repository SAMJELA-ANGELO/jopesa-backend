import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class DefaultAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@jopesa.org';

    if (!user || user.role !== UserRole.ADMIN || user.email !== defaultAdminEmail) {
      throw new ForbiddenException('Access denied. Admin dashboard requires the default admin account.');
    }

    return true;
  }
}
