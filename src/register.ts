import express from "express";
import { HttpResponse } from "./responses";
import { RouteDefinition } from "./controller";
import { ParamDefinition } from "./params";

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
            // Get the registered params for the method
            const params = (
              (Reflect.getMetadata(
                route.methodName,
                controller
              ) as ParamDefinition[]) ?? []
            ).reduce((acc: any[], param) => {
              switch (param.type) {
                case "param":
                  acc[param.index] = req.params[param.name];
                  break;
                case "queryParam":
                  acc[param.index] = req.query[param.name];
                  break;
                case "request":
                  acc[param.index] = req;
                  break;
                case "response":
                  acc[param.index] = res;
                  break;
                case "body":
                  acc[param.index] = req.body;
              }
              return acc;
            }, []);

            // Handle promises / async return values from handler
            Promise.resolve(instance[route.methodName](...params)).then(
              (response) => {
                if (response instanceof HttpResponse) {
                  // If response is an http response, use the built-in apply method to send
                  response.apply(res);
                } else if (typeof response !== "undefined") {
                  // Otherwise if response is defined, wrap it in http response as json and apply it
                  new HttpResponse().json(response).apply(res);
                }
                // If response is undefined and we reach here - just assume the handler has sent a response already
              }
            );
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
