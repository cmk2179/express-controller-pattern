import request from "supertest";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import {
  Controller,
  DELETE,
  GET,
  HEAD,
  OPTIONS,
  POST,
  PUT,
  registerControllers,
  Req,
  Res,
} from "../src";

@Controller("/api")
class ApiController {
  private data: any = { data: "this is server data" };

  @POST("/echo")
  public echo(@Req req: Request, @Res res: Response) {
    res.send(req.body);
  }

  @OPTIONS("/data")
  public getDataOptions(@Res res: Response) {
    res.set("Allow", "HEAD,GET,PUT,DELETE,OPTIONS");
    res.status(200).end();
  }

  @HEAD("/data")
  public getDataHeaders(@Res res: Response) {
    res.set("Content-Length", JSON.stringify(this.data).length.toString());
    res.status(204).end();
  }

  @GET("/data")
  public getData(@Res res: Response) {
    res.json(this.data);
  }

  @PUT("/data")
  public updateData(@Req req: Request, @Res res: Response) {
    res.json({
      ...this.data,
      ...req.body,
    });
  }

  @DELETE("/data")
  public deleteData(@Res res: Response) {
    res.status(204).end();
  }
}

describe("Controller without middleware", () => {
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
    it("should get options for data", () => {
      return request(app)
        .options("/api/data")
        .expect(200)
        .expect("Allow", "HEAD,GET,PUT,DELETE,OPTIONS");
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
    it("should return updated data", () => {
      return request(app)
        .put("/api/data")
        .send({ updated: true })
        .expect(200)
        .then((res) => {
          expect(res.body).toEqual({
            data: "this is server data",
            updated: true,
          });
        });
    });
  });

  describe("DELETE /api/data", () => {
    it("should delete data", () => {
      return request(app).delete("/api/data").expect(204);
    });
  });
});
