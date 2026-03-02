import { SetMetadata } from '@nestjs/common';

export const ADMIN_PUBLIC_KEY = 'admin_public';
export const AdminPublic = () => SetMetadata(ADMIN_PUBLIC_KEY, true);

