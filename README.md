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

So it's time to connect to database. We will use sequelize. 

```bash
    npm install --save pg pg-hstore
    npm install --save @nestjs/sequelize sequelize sequelize-typescript
    npm install --save-dev @types/sequelize
```

Connect database with `import` field in app module. `Import` field allows us to import
additional modules. Here we also move out env variables using `@nestjs/config`.

### `npm install @nestjs/config`

So if we need nest to read all our env config, add ConfigModule to imports.

```typescript
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import {SequelizeModule} from "@nestjs/sequelize";
import {ConfigModule} from "@nestjs/config";

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
      ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`
      }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [],
      autoLoadModels: true
    }),
  ],
})
export class AppModule {

}
```

### `npm install cross-env`

Update scripts to run prod and dev version of project.

```json
{
  "start:dev": "cross-env NODE_ENV=development nest start --watch",
  "start:debug": "nest start --debug --watch",
  "start:prod": "node dist/main"
}
```

Remove `app.service.ts` and `app.controller.ts`. We will decompose our project.

To create new component of our project use nest cli:

```bash
    nest generate module users
    nest generate controller users
    nest generate service users
```

Ok, lets create model of user in `users.model.ts`. Here we're going to describe our user.

```typescript
import {Column, DataType, Model, Table} from "sequelize-typescript";

interface UserCreationAttrs {
    email: string;
    password: string;
}

@Table({tableName: 'users'})
export class User extends Model<User, UserCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @Column({type: DataType.STRING, unique: true, allowNull: false})
    email: string;

    @Column({type: DataType.STRING, allowNull: false})
    password: string;

    @Column({type: DataType.BOOLEAN, defaultValue: false})
    banned: boolean;

    @Column({type: DataType.STRING, allowNull: true})
    banReason: string;
}
```

To make this class a table mark with `@Table` decorator. To make a property in class
a column mark as a `@Column`. Firs generic is a class itself, second - properties, that we
need to create an object from class. Finally, register our model in `app.module.ts`.

```typescript
 SequelizeModule.forRoot({
    // ...
    
      models: [User]
    
    // ...
    })
```

Move to `users.module.ts` and also add User model to import array. 
ForFeature ??????????????????

```typescript
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
      SequelizeModule.forFeature([User])
  ]
})
export class UsersModule {}
```

Now we have this table in pgAdmin.

Add logic to `users.service.ts`. Inject model in our service and create user-dto. Add
functions to work with users.

```typescript
import { Injectable } from '@nestjs/common';
import {User} from "./users.model";
import {InjectModel} from "@nestjs/sequelize";
import {CreateUserDto} from "./dto/create-user-dto";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User) {}

    async createUser(dto: CreateUserDto) {
        return await this.userRepository.create(dto)
    }

    async getAllUsers() {
        return await this.userRepository.findAll()
    }
}
```

Then create endpoint in `users.controller.ts` and inject our users service.

```typescript
import {Body, Controller, Get, Post} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user-dto";
import {UsersService} from "./users.service";

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}


    @Post()
    create(@Body() userDto: CreateUserDto) {
        return this.usersService.createUser(userDto)
    }

    @Get()
    getAll() {
        return this.usersService.getAllUsers()
    }
}
```

## Documentation in swagger

### `npm install @nestjs/swagger swagger-ui-express`

Move to `main.ts` and configure swagger.

```typescript
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

const start = async () => {
//...
    
  const config = new DocumentBuilder()
      .setTitle('Nest app example')
      .setDescription('Swagger for our app')
      .setVersion('1.0.0')
      .addTag('ilichka')
      .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/docs', app, document)

    //...
}
```

Now we need to document all of our endpoints. Use `@ApiOperation` to config endpoint. 
`@ApiResponse` describes response of endpoint. To document models and dto use `@ApiProperty`. 
To group endpoint from controller use `@ApiTags`

- controller
```typescript
import {Body, Controller, Get, Post} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user-dto";
import {UsersService} from "./users.service";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {User} from "./users.model";

@ApiTags('Users')
@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}

    @ApiOperation({summary: 'Create user'})
    @ApiResponse({status: 200, type: User})
    @Post()
    create(@Body() userDto: CreateUserDto) {
        return this.usersService.createUser(userDto)
    }

    @ApiOperation({summary: 'Get users'})
    @ApiResponse({status: 200, type: [User]})
    @Get()
    getAll() {
        return this.usersService.getAllUsers()
    }
}
```

- model
```typescript
import {Column, DataType, Model, Table} from "sequelize-typescript";
import {ApiProperty} from "@nestjs/swagger";

interface UserCreationAttrs {
    email: string;
    password: string;
}

@Table({tableName: 'users'})
export class User extends Model<User, UserCreationAttrs> {
    @ApiProperty({example: '1', description: 'Unique id'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 'user@gmail.com', description: 'User email'})
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    email: string;

    @ApiProperty({example: '12345', description: 'User password'})
    @Column({type: DataType.STRING, allowNull: false})
    password: string;

    @ApiProperty({example: 'true', description: 'Is user banned or not'})
    @Column({type: DataType.BOOLEAN, defaultValue: false})
    banned: boolean;

    @ApiProperty({example: 'Platform politic', description: 'Description of ban'})
    @Column({type: DataType.STRING, allowNull: true})
    banReason: string;
}
```

- dto 
```typescript
import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({example: 'user@gmail.com', description: 'User email'})
    readonly email: string;
    @ApiProperty({example: '12345', description: 'User password'})
    readonly password: string;
}
```

## Roles and rules

```bash
    nest generate module roles
    nest generate controller roles
    nest generate service roles
```

And create model here

```typescript
import {Column, DataType, Model, Table} from "sequelize-typescript";
import {ApiProperty} from "@nestjs/swagger";

interface RoleCreationAttrs {
    value: string;
    description: string;
}

@Table({tableName: 'roles'})
export class Role extends Model<Role, RoleCreationAttrs> {
    @ApiProperty({example: '1', description: 'Unique id'})
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ApiProperty({example: 'ADMIN', description: 'User role value'})
    @Column({type: DataType.STRING, unique: true, allowNull: false})
    value: string;

    @ApiProperty({example: 'Administrator', description: 'Role description'})
    @Column({type: DataType.STRING, allowNull: false})
    description: string;
}
```

Important! Cause each user can have many roles and each role can belong to many users, so
relations between two tables may-to-many. In this case we should create third table and in this
table we store, which user has witch roles. 

![users-roles-view](users-roles-tables.png)

To create this relations use decorator `@BelongsToMany`. First arg is an entity, with
witch we connect and the second arg is a table, witch trough we connect. In `users.model.ts`

```typescript
@Table({tableName: 'users'})
export class User extends Model<User, UserCreationAttrs> {
    //...

    @BelongsToMany(()=>Role, ()=>UserRole)
    roles: Role[]
}
```

In `roles.model.ts`:

```typescript
@Table({tableName: 'roles'})
export class Role extends Model<Role, RoleCreationAttrs> {
    //...

    @BelongsToMany(()=>User, ()=>UserRole)
    user: User[]
}
```

Also we need to import both of models(`Role` and `User`) in modules.

Now we need to create this temporary table user-roles:

```typescript
import {Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {Role} from "./roles.model";
import {User} from "../users/users.model";

@Table({tableName: 'roles', createdAt: false, updatedAt: false})
export class UserRoles extends Model<UserRoles> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ForeignKey(()=>Role)
    @Column({type: DataType.INTEGER})
    roleId: number;

    @ForeignKey(()=>User)
    @Column({type: DataType.INTEGER})
    userId: number;
}
```

Use decorator `@ForeignKey` to mark a field as a foreign key. Add UserRoles to import in modules(`app`, `user`, `role`).
Then just create functions to work with roles in service and create endpoints in controller.
When we create a user we need to assign a role to him. So let's inject roleService in usersService.
In this case we need to register this service as well.
1. Export roleService
```typescript
@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    SequelizeModule.forFeature([Role, User, UserRoles])
  ],
  exports: [RolesService]
})
```
After this rolesService will export with rolesModule.

2. Import RolesModule into UsersModule
```typescript
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
      SequelizeModule.forFeature([User, Role, UserRoles]),
      RolesModule
  ]
})
```

Update createUser function:

```typescript
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User,
                private roleService: RolesService) {}

    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto)
        const role = await this.roleService.getRoleByValue("USER")
        await user.$set('roles',[role.id])
        return user
    }
}
```

`$set` method allows to rewrite a field and update it in database. Update methods in
`user.service.ts`

```typescript
@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User,
                private roleService: RolesService) {}

    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto)
        const role = await this.roleService.getRoleByValue("USER")
        await user.$set('roles',[role.id])
        return user
    }

    async getAllUsers() {
        return await this.userRepository.findAll({include:{all: true}})
    }
}
```

Here we added `{include: {allL true}}` to include all fields, that user connected with.