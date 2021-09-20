import express from "express";
import { RouteDefinition } from "controller";

export type ControllerFn<T> = new (...args: any[]) => T;

export function registerControllers(
  app: express.Application,
  controllers: ControllerFn<any>[]
) {
  controllers.forEach((controller) => {
    // This is the instantiated controller class
    const instance = new controller();

    // The prefix saved for the controller
    const prefix = Reflect.getMetadata("prefix", controller);

    // The middleware for all routes in the controller
    const middleware = Reflect.getMetadata("middleware", controller);

    // Routes array containing all our routes for this controller
    const routes: RouteDefinition[] = Reflect.getMetadata("routes", controller);

    // Iterate over all routes and register them to our express application
    routes.forEach((route) => {
      // Make sure that route.method key exists on app and that it is a function
      if (typeof app[route.method] === "function") {
        app[route.method](
          `${prefix}${route.path}`,
          ...middleware,
          ...route.middleware,
          (req: express.Request, res: express.Response) => {
            // Execute our method for this path and pass our express request and response object.
            instance[route.methodName](req, res);
          }
        );
      } else {
        console.warn(
          `No method with name '${route.method}' exists on express application.`
        );
      }
    });
  });
}
