import { Express } from "express";
import { Firestore } from "@google-cloud/firestore";
import { BuildController } from "./controllers/builder.controller";

function routes(app: Express, db: Firestore) {
  const buildController = new BuildController(db);

  /**
  
  /* User Routes */
  /**
   * @openapi
   * '/api/v1/healthcheck':
   *  get:
   *    tags:
   *      - Healthcheck
   *    summary: Get the status of the server
   *    responses:
   *      200:
   *        description: Success
   */
  app.get("/api/v1/healthcheck", (req, res) => {
    res.sendStatus(200);
  });

  /* Builder Route */
  /**
   * @openapi
   * '/api/v1/aibuilder':
   *  post:
   *    tags:
   *      - Build
   *    summary: Generate a new build using ai
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/GenerateBuildRequest'
   *    responses:
   *      200:
   *        description: Success
   */
  app.post("/api/v1/aibuilder", (req, res) => {
    buildController.generateBuild(req, res);
  });

  /**
   * @openapi
   * '/api/v1/builds':
   *  post:
   *    tags:
   *      - Build
   *    summary: Create a new build
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/CreateBuildRequest'
   *    responses:
   *      200:
   *        description: Success
   */
  app.post("/api/v1/builds", (req, res) => {
    buildController.createBuild(req, res);
  });

  /**
   * @openapi
   * '/api/v1/builds/{build_id}':
   *  delete:
   *    tags:
   *      - Build
   *    summary: Delete a build
   *    parameters:
   *      - name: build_id
   *        in: path
   *        description: Build ID
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */
  app.delete("/api/v1/builds/:build_id", (req, res) => {
    buildController.deleteBuild(req, res);
  });

  /**
   * @openapi
   * '/api/v1/builds/{build_id}':
   *  get:
   *    tags:
   *      - Build
   *    summary: Get data of a build
   *    parameters:
   *      - name: build_id
   *        in: path
   *        description: Build ID
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */
  app.get("/api/v1/builds/:build_id", (req, res) => {
    buildController.showBuildData(req, res);
  });

  /**
   * @openapi
   * '/api/v1/builds/{build_id}':
   *  put:
   *    tags:
   *      - Build
   *    summary: Update data of a build
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/UpdateBuildRequest'
   *    parameters:
   *      - name: build_id
   *        in: path
   *        description: Build ID
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */
  app.put("/api/v1/builds/:build_id", (req, res) => {
    buildController.updateBuild(req, res);
  });

  /**
   * @openapi
   * '/api/v1/builds':
   *  get:
   *    tags:
   *      - Build
   *    summary: Get all builds
   *    responses:
   *      200:
   *        description: Success
   */
  app.get("/api/v1/builds", (req, res) => {
    buildController.showAllBuildData(req, res);
  });

  /* Nonexisting Route handling */
  app.all("*", (req, res) => {
    res.status(404).json({ error: "Cannot access route" });
  });
}

export default routes;
