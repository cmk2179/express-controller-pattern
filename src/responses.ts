import { Response } from "express";

export class HttpResponse {
  protected headers: Map<string, string> = new Map([]);
  protected statusCode: number = 200;
  protected body: any | undefined;

  protected isJson: boolean = false;

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
      res.status(this.statusCode).end();
    } else if (this.isJson) {
      res.status(this.statusCode).json(this.body);
    } else {
      res.status(this.statusCode).send(this.body);
    }
  }
}
