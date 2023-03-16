import { NestFactory } from '@nestjs/core';
import { AppModule } from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {ValidationPipe} from "./pipes/validation.pipe";


const start = async () => {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
      .setTitle('Nest app example')
      .setDescription('Swagger for our app')
      .setVersion('1.0.0')
      .addTag('ilichka')
      .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/docs', app, document)

  await app.listen(PORT, ()=>console.log(`Server is running on ${PORT}`))
}

start()