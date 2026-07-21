import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.use(
    session({
      secret: 'mySecretKey',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 3001;

  await app.listen(port);

  console.log(`Backend running at http://localhost:${port}`);
}

bootstrap();