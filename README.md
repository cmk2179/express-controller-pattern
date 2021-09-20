# Express controller pattern

Having worked a lot with typescript and express if just felt that something was missing in the way routes are registered and found that there are a few articles on how to use decorators for route creation with express, but I did not find any recent, up-to-date npm packages that solved this in a way I found practical.

I like the way that C# and other languages set up routing, using controllers - so I started reading articles on the web and after reading [this](https://nehalist.io/routing-with-typescript-decorators/) article, I was inspired to create an npm package that uses decorators for routing using express.

## Documentation

Base decorators:

- `@Controller(routePrefix)`
- `@Route(path, httpVerb)`

Convenience decorators, aliases for `@Route`:

- `@GET(path)` -> `@Route(path, "get")`
- `@PUT(path)` -> `@Route(path, "put")`
- `@POST(path)` -> `@Route(path, "post")`
- `@HEAD(path)` -> `@Route(path, "head")`
- `@DELETE(path)` -> `@Route(path, "delete")`
- `@OPTIONS(path)` -> `@Route(path, "options")`

All decorators also accepts optional middleware functions that are applied in the following order:

1. Controller wide middleware, via `@Controller`, are applied first and applies to all routes in the controller
2. Route specific middleware, via `@Route`, `@GET`, `@POST`, etc. are applied only for the given route, after any middleware that has been applied controller wide

### Sample controller

```typescript
@Controller("/api/user")
export class UserController {
  @GET("/")
  public async getUsers(req: Request, res: Response) {
    const users = await userDbClient.getAllUsers();
    res.json(users);
  }

  @GET("/:id")
  public async getUser(req: Request, res: Response) {
    const user = await userDbClient.getUser(req.params.id);
    res.json(user);
  }

  /* ... other methods for updating, deleting and modifying a user ... */
}
```

## Ideas for improvement

- Auto import controllers in folder
- Instead of using req and res, the controller method should get relevant arguments passed in and return a response object instead. Perhaps input arguments could be via some kind of dependency injection using decorators.
