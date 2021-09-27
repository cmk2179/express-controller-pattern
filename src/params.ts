import { Request, Response } from "express";

export type ParamResolver = (req: Request, res: Response) => any;

export interface ParamDefinition {
  index: number;
  name: string;
  resolver: ParamResolver;
}

const RegisterToken = (tokenName: string, resolver: ParamResolver) => {
  return (target: any, propertyKey: string | symbol, index: number) => {
    if (!Reflect.hasMetadata(propertyKey, target.constructor)) {
      Reflect.defineMetadata(propertyKey, [], target.constructor);
    }

    const params: ParamDefinition[] = Reflect.getMetadata(
      propertyKey,
      target.constructor
    );
    params.push({
      index,
      name: tokenName,
      resolver,
    });
    Reflect.defineMetadata(propertyKey, params, target.constructor);
  };
};

export const Param = (name: string) =>
  RegisterToken(name, (req) => req.params[name]);
export const QueryParam = (name: string) =>
  RegisterToken(name, (req) => req.query[name]);
export const Req = RegisterToken("req", (req) => req);
export const Res = RegisterToken("res", (req, res) => res);
export const Body = RegisterToken("body", (req) => req.body);
export const ServerUri = RegisterToken(
  "serverUri",
  (req) => `${req.protocol}://${req.get("Host")}`
);
