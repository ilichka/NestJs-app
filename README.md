## Install nest cli 

```bash
npm i -g @nestjs/cli
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Create `main.ts` file and it would be a startpoint of our application. Create an instance of 
our application with `NestFactory` and start listening it: 

```typescript
import { NestFactory } from '@nestjs/core';


const start = async () => {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(); // here we need to pass modules in arguments
  await app.listen(PORT, ()=>console.log(`Server is running on ${PORT}`))
}
```

Create `app.module.ts` and export class `AppModule`. NestJs bases on decorators, so we have
to mark our class with `@Module` decorator. Decorator - is a wrapper that provides to a class or a 
function new abilities.

```typescript
import { Module } from "@nestjs/common";

@Module({}) // here we will pass an config object
export class AppModule {

}
```

Return to our `main.ts` and add pass this `AppModule` to `create()` function:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from "./app.module";


const start = async () => {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT, ()=>console.log(`Server is running on ${PORT}`))
}

start()
```

Ok, let's move on. Create `app.controller.ts`. Mark this controller with `@Controller` decorator.
`@Controller` accepts prefix of url. Create function in this controller and to make this
function an endpoint we have to mark it with decorator and pass a url.

```typescript
import { Controller, Get } from "@nestjs/common";

@Controller('/api')
export class AppController {

  @Get('/users')
  getUsers() {
    return [{id: 1, name: 'ilichka'}]
  }
}
```

Then to make this controller work we need to register it in modules.

```typescript
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";

@Module({
  controllers: [AppController]
})
export class AppModule {

}
```

That's it! Now we can run 
### `npm run start:dev`
and move to [http://localhost:5000/api/users](http://localhost:5000/api/users) to 
receive the result of our endpoint.

Providers field in `@Module`. Providers mostly are services with reusable logic or some 
patterns implementations. Lets create our first provider `app.service.ts`. To make this class a provider
mark this class with `@Injectable` decorator. We need this services to make controller stay minimalistic.
To use our service inside controller we need to add it in provides field.

```typescript
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {

}
```

To use this service inside this controller we need to make `DI`. So we don't have to create
an object, nest will do it automatically.

```typescript
import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller('/api')
export class AppController {

  constructor(private appService: AppService) {}

  @Get('/users')
  getUsers() {
    return this.appService.getUsers()
  }
}
```

So it's time to connect to database