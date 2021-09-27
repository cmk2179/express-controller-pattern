import { Request, Response } from "express";

export type ParamResolver = (req: Request, res: Response) => any;

export interface ParamDefinition {
  index: number;
  resolver: ParamResolver;
}

export const createInjectionToken = (resolver: ParamResolver) => {
  return (target: any, propertyKey: string | symbol, index: number) => {
    if (!Reflect.hasMetadata(propertyKey, target.constructor)) {
      Reflect.defineMetadata(propertyKey, [], target.constructor);
    }

    const params: ParamDefinition[] = Reflect.getMetadata(
      propertyKey,
      target.constructor
    );
    params.push({ index, resolver });
    Reflect.defineMetadata(propertyKey, params, target.constructor);
  };
};

export const Param = (name: string) =>
  createInjectionToken((req) => req.params[name]);
export const QueryParam = (name: string) =>
  createInjectionToken((req) => req.query[name]);
export const Req = createInjectionToken((req) => req);
export const Res = createInjectionToken((req, res) => res);
export const Body = createInjectionToken((req) => req.body);
export const ServerUri = createInjectionToken(
  (req) => `${req.protocol}://${req.get("Host")}`
);
