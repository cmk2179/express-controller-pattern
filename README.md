# Express controller pattern

Having worked a lot with typescript and express I just felt that something was missing in the way routes are registered and found that there are a few articles on how to use decorators for route creation with express, but I did not find any recent, up-to-date npm packages that solved this in a way I found practical.

I like the way that C# and other languages set up routing, using controllers - so I started reading articles on the web and after reading [this](https://nehalist.io/routing-with-typescript-decorators/) article, I was inspired to create an npm package that uses decorators for routing using express.

## Documentation

### Creating a controller with routes

A controller is a class decorated with `@Controller(routePrefix)`. The `routePrefix` is prepended to all routes in the controller class. A route can be created by decorating a class method with `@Route(path, httpVerb)` or one of the following convenience decorators that work as aliases for `@Route`-

- `@GET(path)` -> `@Route(path, "get")`
- `@PUT(path)` -> `@Route(path, "put")`
- `@POST(path)` -> `@Route(path, "post")`
- `@HEAD(path)` -> `@Route(path, "head")`
- `@DELETE(path)` -> `@Route(path, "delete")`
- `@OPTIONS(path)` -> `@Route(path, "options")`

All decorators also accepts optional middleware functions that are applied in the following order:

1. Controller wide middleware, via `@Controller`, are applied first and applies to all routes in the controller
2. Route specific middleware, via `@Route`, `@GET`, `@POST`, etc. are applied only for the given route, after any middleware that has been applied controller wide

### Accessing request data

To access request data, a simple form of injection is in place which can be used to select e.g. the request body, path params or query params. It is also possible to inject the express `Request` and `Response` objects. The following examples shows how to use injection, given a very simple CRUD API:

```typescript
@Controller("/api/something")
class SomethingController {
  public list(@QueryParam("filter") filter: string) {
    /* ... */
  }
  public create(@Body body: any) {
    /* ... */
  }
  public read() {
    /* ... */
  }
  public update(@Param("id") id: string, @Body body: any) {
    /* ... */
  }
  public delete(@Param("id") id: string) {
    /* ... */
  }
}
```

It is also possible to access the express `Request` and `Response` objects using `@Req` and `@Res` decorators:

```typescript
@Controller("/api/something")
class SomethingController {
  public doSomething(@Req req: Request, @Res res: Response) {
    /* ... */
  }
}
```

### Handling responses

There are multiple ways to handle responses, the simplest way is to return an object or a promise from the controller method. For more fine grained control it is possible to use the `Request` and `Response` objects from express directly as show in the previous section or return an instance of `HttpResponse` from the method. All `HttpResponse` methods returns the instance ifself so multiple calls can easily be chained, see the sample controller in the next section.

### Example controller

A simplified controller that uses a little bit of everything that has been explained above. While some functions and interfaces have not been implemented the example should still give an idea of the different usecases.

```typescript
import {
  Controller,
  GET,
  POST,
  OPTIONS,
  QueryParam,
  Body,
  Param,
} from "express-controller-pattern";

// Add a controller wide middleware for logging requests to this controller, prefixed with the class name
@Controller("/api/user", [createLoggerMiddleware("UserController")])
export class UserController {
  @GET("/")
  public async getUsers(@QueryParam("filter") filter): Promise<User[]> {
    // returns a promise that resolves to an array of all users
    return userDbClient.getAllUsers({ filter });
  }

  // Add middleware to only this route, that prevents unauthorized access
  @POST("/", [isAuthorized])
  public createUser(@Body user: User) {
    // validation returns an HttpResponse with status 400 on missing parameters
    if (!user.firstName || !user.lastName) {
      return new HttpResponse().status(400).json({
        message: "First name and last name are required",
      });
    }

    // returns a promise that resolves to the created user
    return userDbClient.create(user);
  }

  @OPTIONS("/")
  public getUsersOptions(): HttpResponse {
    // returns an HttpResponse with custom header - calling end is necessary on requests that do not have a body
    return new HttpResponse().setHeader("Allow", "GET,POST,OPTIONS").end();
  }

  @GET("/:id")
  public async getUser(@Param("id") id: string): Promise<User> {
    // returns a promise that resolves to an object containing the specific user
    return userDbClient.getUser(id);
  }

  /* ... other methods for updating, deleting and modifying a user ... */
}
```

To register controllers use the `registerControllers` method and call it with the express application and a list of controllers that should be registered.

```typescript
import express from "express";
import { registerControllers } from "express-controller-pattern";

const app = express();

registerControllers(app, [
  UserController,
  SomethingController,
  /* ... */
]);

app.listen(3000);
```

## Ideas for improvement

- Auto import controllers in folder
- Injection in middleware similar to the way it works in controller
- Better injection support, more dynamic. Possibly allowing the addition of other tokens in from the consuming application.
