import { Response } from "express";

export class HttpResponse {
  protected headers: Map<string, string> = new Map([]);
  protected statusCode: number = 200;
  protected body: any | undefined;

  protected isJson: boolean = false;

  static Redirect(location: string, statusCode: number = 302) {
    return new HttpResponse()
      .status(statusCode)
      .setHeader("Location", location);
  }

  static Ok() {
    return new HttpResponse().status(200);
  }

  static NoContent() {
    return new HttpResponse().status(204).end();
  }

  static NotFound() {
    return new HttpResponse().status(404).end();
  }

  static BadRequest(body?: any) {
    const res = new HttpResponse().status(400);
    if (body) {
      return res.json(body);
    }
    return res;
  }

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  setHeader(name: string, value: string) {
    this.headers.set(name, value);
    return this;
  }

  data(body: any | undefined, contentType: string = "text/plain") {
    this.isJson = false;
    this.body = body;
    this.setHeader("Content-Type", contentType);
    return this;
  }

  text(body: string) {
    return this.data(body, "text/plain");
  }

  html(body: string) {
    return this.data(body, "text/html");
  }

  json(body: any) {
    this.isJson = true;
    this.body = body;
    return this;
  }

  end() {
    this.body = undefined;
    return this;
  }

  apply(res: Response) {
    for (const entry of this.headers.entries()) {
      res.set(entry[0], entry[1]);
    }

    if (typeof this.body === "undefined") {
      // if there is no body, use end instead of send or json
      res.status(this.statusCode).end();
    } else if (this.isJson) {
      // If json is expected, send as json
      res.status(this.statusCode).json(this.body);
    } else {
      // Always send body as string, if it is a number express thinks it is sending a status code
      res.status(this.statusCode).send(this.body.toString());
    }
  }
}

export class View<T extends object> {
  constructor(private view: string, private data: T) {}

  apply(res: Response) {
    res.render(this.view, this.data);
  }
}
