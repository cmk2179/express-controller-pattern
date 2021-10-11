import request from "supertest";
import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import {
  Body,
  Controller,
  DELETE,
  GET,
  HEAD,
  HttpResponse,
  OPTIONS,
  POST,
  PUT,
  registerControllers,
  Req,
  Res,
} from "../src";

// Middleware to block unathenticated users - no practical use, just for test purpose
function isAuthenticated(req: Request, res: Response) {
  res.status(401).end();
}

// Middleware that prevents options request - no practial use, just for test purpose
function specialHandler(req: Request, res: Response, next: NextFunction) {
  if (req.method.toLowerCase() === "options") {
    return res.status(501).end();
  }
  next();
}

// Block all options requests to /api
@Controller("/api", [specialHandler])
class ApiController {
  private data: any = { data: "this is server data" };

  @POST("/echo")
  public echo(@Body body: any) {
    return body;
  }

  @OPTIONS("/data")
  public getDataOptions() {
    return HttpResponse.Ok().setHeader("Allow", "HEAD,GET,PUT,DELETE,OPTIONS");
  }

  @HEAD("/data")
  public getDataHeaders() {
    return HttpResponse.NoContent().setHeader(
      "Content-Length",
      JSON.stringify(this.data).length.toString()
    );
  }

  @GET("/data")
  public getData() {
    return this.data;
  }

  // Block all requests to PUT /data
  @PUT("/data", [isAuthenticated])
  public updateData(@Body body: any) {
    return {
      ...this.data,
      ...body,
    };
  }

  // Block all requests to DELETE /data
  @DELETE("/data", [isAuthenticated])
  public deleteData() {
    return HttpResponse.NoContent();
  }
}

describe("Controller with middleware", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    registerControllers(app, [ApiController]);
  });

  describe("POST /api/echo", () => {
    it("should echo post request body", () => {
      return request(app)
        .post("/api/echo")
        .send({ message: "hello world" })
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({ message: "hello world" });
        });
    });
  });

  describe("OPTIONS /api/data", () => {
    it("should return not implemented status code", () => {
      return request(app).options("/api/data").expect(501);
    });
  });

  describe("HEAD /api/data", () => {
    it("should get headers for data", () => {
      return request(app)
        .head("/api/data")
        .expect(204)
        .expect("Content-Length", "30");
    });
  });

  describe("GET /api/data", () => {
    it("should return data", () => {
      return request(app)
        .get("/api/data")
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({ data: "this is server data" });
        });
    });
  });

  describe("PUT /api/data", () => {
    it("should not be allowed", () => {
      return request(app).put("/api/data").send({ updated: true }).expect(401);
    });
  });

  describe("DELETE /api/data", () => {
    it("should not be allowed", () => {
      return request(app).delete("/api/data").expect(401);
    });
  });
});
