import express from "express";
import { RouteDefinition } from "controller";

export type ControllerFn<T> = new (...args: any[]) => T;

export function registerControllers(
  app: express.Application,
  controllers: ControllerFn<any>[]
) {
  controllers.forEach((controller) => {
    // This is our instantiated class
    const instance = new controller();

    // The prefix saved to our controller
    const prefix = Reflect.getMetadata("prefix", controller);

    // The middleware for all routes in our controller
    const middleware = Reflect.getMetadata("middleware", controller);

    // Our `routes` array containing all our routes for this controller
    const routes: RouteDefinition[] = Reflect.getMetadata("routes", controller);

    // Iterate over all routes and register them to our express application
    routes.forEach((route) => {
      // It would be a good idea at this point to substitute the `app[route.requestMethod]` with a `switch/case` statement
      // since we can't be sure about the availability of methods on our `app` object. But for the sake of simplicity
      // this should be enough for now.
      app[route.method](
        `${prefix}${route.path}`,
        ...middleware,
        ...route.middleware,
        (req: express.Request, res: express.Response) => {
          // Execute our method for this path and pass our express request and response object.
          instance[route.methodName](req, res);
        }
      );
    });
  });
}
