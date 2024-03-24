import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as admin from "firebase-admin";
import { Firestore } from "@google-cloud/firestore";
import { ResponseUtils } from "../utils/response.utils";
import { BuildModel } from "../models/build.model";

export class BuildController {
  constructor(private db: Firestore) {}

  /**
   * @openapi
   * components:
   *  schemas:
   *      CreateBuildRequest:
   *          type: object
   *          properties:
   *              PROCESSEUR:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              REFROIDISSEMENT:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              CARTE_MERE:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              BARETTE_MEMOIRE:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              ALIMENTATION:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              DISQUE_SSD:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              DISQUE_HDD:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              DISQUE_NVME:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              VENTILATEUR:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              CARTE_GRAPHIQUE:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *
   *      UpdateBuildRequest:
   *          type: object
   *          properties:
   *              PROCESSEUR:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              REFROIDISSEMENT:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              CARTE_MERE:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              BARETTE_MEMOIRE:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              ALIMENTATION:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              DISQUE_SSD:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              DISQUE_HDD:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              DISQUE_NVME:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              VENTILATEUR:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   *              CARTE_GRAPHIQUE:
   *                  type: array
   *                  items:
   *                      $ref: '#/definitions/ComponentModel'
   */

  async createBuild(req: Request, res: Response) {
    try {
      const buildData: BuildModel = {
        PROCESSEUR: req.body.PROCESSEUR || [],
        REFROIDISSEMENT: req.body.REFROIDISSEMENT || [],
        CARTE_MERE: req.body.CARTE_MERE || [],
        BARETTE_MEMOIRE: req.body.BARETTE_MEMOIRE || [],
        ALIMENTATION: req.body.ALIMENTATION || [],
        DISQUE_SSD: req.body.DISQUE_SSD || [],
        DISQUE_HDD: req.body.DISQUE_HDD || [],
        DISQUE_NVME: req.body.DISQUE_NVME || [],
        VENTILATEUR: req.body.VENTILATEUR || [],
        CARTE_GRAPHIQUE: req.body.CARTE_GRAPHIQUE || [],
        dateCreated: admin.firestore.Timestamp.now(),
      };

      const buildId = uuidv4();
      const buildRef = this.db.collection("builds").doc(buildId);
      await buildRef.set(buildData);

      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Build created successfully",
        buildData
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to create build",
        error
      );
    }
  }

  async deleteBuild(req: Request, res: Response) {
    try {
      const buildId = req.params.build_id;
      const buildRef = this.db.collection("builds").doc(buildId);

      const buildDoc = await buildRef.get();
      if (!buildDoc.exists) {
        return ResponseUtils.sendErrorResponse(
          res,
          404,
          "Build not found",
          null
        );
      }

      await buildRef.delete();
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Build deleted successfully",
        buildDoc.data()
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to delete build",
        error
      );
    }
  }

  async updateBuild(req: Request, res: Response) {
    try {
      const buildId = req.params.build_id;
      const buildData: Partial<BuildModel> = {
        PROCESSEUR: req.body.PROCESSEUR,
        REFROIDISSEMENT: req.body.REFROIDISSEMENT,
        CARTE_MERE: req.body.CARTE_MERE,
        BARETTE_MEMOIRE: req.body.BARETTE_MEMOIRE,
        ALIMENTATION: req.body.ALIMENTATION,
        DISQUE_SSD: req.body.DISQUE_SSD,
        DISQUE_HDD: req.body.DISQUE_HDD,
        DISQUE_NVME: req.body.DISQUE_NVME,
        VENTILATEUR: req.body.VENTILATEUR,
        CARTE_GRAPHIQUE: req.body.CARTE_GRAPHIQUE,
      };

      const buildRef = this.db.collection("builds").doc(buildId);
      const buildDoc = await buildRef.get();

      if (!buildDoc.exists) {
        return ResponseUtils.sendErrorResponse(
          res,
          404,
          "Build not found",
          null
        );
      }

      await buildRef.update(buildData as { [x: string]: any });
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Build updated successfully",
        buildData
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to update build",
        error
      );
    }
  }

  async showBuildData(req: Request, res: Response) {
    try {
      const buildId = req.params.build_id;
      const buildRef = this.db.collection("builds").doc(buildId);
      const buildDoc = await buildRef.get();

      if (!buildDoc.exists) {
        return ResponseUtils.sendErrorResponse(
          res,
          404,
          "Build not found",
          null
        );
      }

      const buildData = buildDoc.data() as BuildModel;
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Build data retrieved successfully",
        buildData
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to retrieve build data",
        error
      );
    }
  }

  async showAllBuildData(req: Request, res: Response) {
    try {
      const buildsRef = this.db.collection("builds");
      const buildsSnapshot = await buildsRef.get();
      const buildsData: BuildModel[] = buildsSnapshot.docs.map(
        (doc) => doc.data() as BuildModel
      );
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "All build data retrieved successfully",
        buildsData
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to retrieve all build data",
        error
      );
    }
  }
}
