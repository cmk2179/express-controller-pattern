import request from "supertest";
import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import {
  Controller,
  GET,
  HttpResponse,
  Param,
  POST,
  registerControllers,
  ServerUri,
  View,
} from "../src";
import path from "path";

@Controller("/")
class IndexController {
  @GET("/:id")
  public renderPage(@Param("id") id: string) {
    return new View(path.join(__dirname, "./test-view.ejs"), { id });
  }

  @POST("/:id")
  public updateEntity(@Param("id") id: string, @ServerUri serverUri: string) {
    return HttpResponse.Redirect(`${serverUri}/${id}`);
  }
}

describe("Controller using views", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.set("view engine", "ejs");
    registerControllers(app, [IndexController]);
  });

  it("should render view", () => {
    return request(app)
      .get("/234")
      .expect(200)
      .expect("Content-Type", "text/html; charset=utf-8")
      .then((res) => {
        expect(res.text).toEqual("<h2>ID:234</h2>");
      });
  });

  it("should redirect", () => {
    const req = request(app).post("/235");
    const reqUrl = new URL(req.url);

    return req.expect(302).then((res) => {
      expect(res.headers.location).toEqual(`http://${reqUrl.host}/235`);
    });
  });
});
