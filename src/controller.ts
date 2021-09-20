import express from "express";

export const Controller = (
  prefix: string = "",
  middleware: express.Handler[] = []
): ClassDecorator => {
  return (target: any) => {
    Reflect.defineMetadata("prefix", prefix, target);
    Reflect.defineMetadata("middleware", middleware, target);

    // Since routes are set by our methods this should almost never be true (except the controller has no methods)
    if (!Reflect.hasMetadata("routes", target)) {
      Reflect.defineMetadata("routes", [], target);
    }
  };
};

export type HttpVerb = "get" | "post" | "put" | "delete" | "options" | "head";

export interface RouteDefinition {
  method: HttpVerb;
  path: string;
  methodName: string | symbol;
  middleware: express.Handler[];
}

export const Route = (
  path: string,
  httpMethod: HttpVerb = "get",
  middleware: express.Handler[]
): MethodDecorator => {
  // `target` equals our class, `propertyKey` equals our decorated method name
  return (target, propertyKey: string | symbol): void => {
    // In case this is the first route to be registered the `routes` metadata is likely to be undefined at this point.
    // To prevent any further validation simply set it to an empty array here.
    if (!Reflect.hasMetadata("routes", target.constructor)) {
      Reflect.defineMetadata("routes", [], target.constructor);
    }

    // Get the routes stored so far, extend it by the new route and re-set the metadata.
    const routes = Reflect.getMetadata(
      "routes",
      target.constructor
    ) as Array<RouteDefinition>;

    routes.push({
      method: httpMethod,
      path,
      methodName: propertyKey,
      middleware,
    });
    Reflect.defineMetadata("routes", routes, target.constructor);
  };
};

export const GET = (
  path: string,
  middleware: express.Handler[] = []
): MethodDecorator => Route(path, "get", middleware);

export const POST = (
  path: string,
  middleware: express.Handler[] = []
): MethodDecorator => Route(path, "post", middleware);

export const PUT = (
  path: string,
  middleware: express.Handler[] = []
): MethodDecorator => Route(path, "put", middleware);

export const OPTIONS = (
  path: string,
  middleware: express.Handler[] = []
): MethodDecorator => Route(path, "options", middleware);

export const DELETE = (
  path: string,
  middleware: express.Handler[] = []
): MethodDecorator => Route(path, "delete", middleware);

export const HEAD = (
  path: string,
  middleware: express.Handler[] = []
): MethodDecorator => Route(path, "head", middleware);
