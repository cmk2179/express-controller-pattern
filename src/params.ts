export interface ParamDefinition {
  index: number;
  name: string;
  type: string;
}

const RegisterParam = (name: string, type: string) => {
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
      name,
      type,
    });
    Reflect.defineMetadata(propertyKey, params, target.constructor);
  };
};

export const Param = (name: string) => RegisterParam(name, "param");
export const QueryParam = (name: string) => RegisterParam(name, "queryParam");
export const Req = RegisterParam("req", "request");
export const Res = RegisterParam("res", "response");
export const Body = RegisterParam("body", "body");
