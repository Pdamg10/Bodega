import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';
import { UserRole } from './src/users/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  
  try {
    const admin = await usersService.findOne('admin');
    if (!admin) {
      await usersService.create({
        username: 'admin',
        password_hash: 'admin123',
        role: UserRole.ADMIN,
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@bodega.com',
        isActive: true
      });
      console.log('✅ Admin user created: admin / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
  
  await app.close();
}
bootstrap();
