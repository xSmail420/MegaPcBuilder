import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as admin from "firebase-admin";
import { Firestore } from "@google-cloud/firestore";
import { ResponseUtils } from "../utils/response.utils";
import {
  BuildDataModel,
  BuildExampleModel,
  BuildModel,
  IBuildModel,
} from "../models/build.model";
import { generateComputerBuild } from "../utils/aibuilder.utils";
import {
  componentTypes,
  filterComponentsByBudget,
  getComponentData,
} from "../utils/components.utils";
import { userInfo } from "os";

export class BuildController {
  constructor(private db: Firestore) {}

  /**
   * @openapi
   * components:
   *  schemas:
   *      GenerateBuildRequest:
   *          type: object
   *          properties:
   *              budget: number
   *              purpose: string
   *              prefs: string
   *          required: [budget, purpose]
   *          example: { budget: 3000, purpose: "Gaming", prefs: "intel processor and water cooling" }
   *
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

  async generateBuild(req: Request, res: Response) {
    try {
      // Get user input from request body
      const userInput = {
        budget: req.body.budget || 0,
        purpose: req.body.purpose || "",
        prefs: req.body.prefs || "",
      };

      // Generate computer build using OpenAI API and filteredComponents as context
      const generatedBuild = await generateComputerBuild(userInput, this.db);

      // Create build data
      const buildId = uuidv4();

      // Initialize fullBuildData with buildId

      if (!generatedBuild) {
        return ResponseUtils.sendErrorResponse(
          res,
          500,
          "Error generating build",
          null
        );
      }
      // calculate total price
      let totalPrice = 0;

      // Iterate over each component in the generatedBuild and sum up their prices
      Object.values(generatedBuild).forEach((component: any) => {
        if (component && component.price) {
          totalPrice += component.price;
        }
      });

      const fullBuildData: Partial<IBuildModel> = {
        buildId: buildId,
        dateCreated: admin.firestore.Timestamp.now(),
        ...generatedBuild,
        price: totalPrice,
      };
      // Save build data to Firestore
      const buildRef = this.db.collection("builds").doc(buildId);
      await buildRef.set(fullBuildData);

      // Sending success response
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Build created successfully",
        fullBuildData
      );
    } catch (error: any) {
      console.log("error : ", error);

      // Sending error response
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to create build",
        error
      );
    }
  }

  async createBuild(req: Request, res: Response) {
    try {
      const buildId = uuidv4();
      const buildData: IBuildModel = {
        buildId: buildId,
        PROCESSEUR: req.body.data.cpu,
        REFROIDISSEMENT: req.body.data.cooling,
        "CARTE MÈRE": req.body.data.motherboard,
        "BARETTE MÉMOIRE": req.body.data.ram,
        ALIMENTATION: req.body.data.powersupply,
        "CARTE GRAPHIQUE": req.body.data.gpu,
        BOITIER: req.body.data.pccase,
        STORAGE: req.body.data.storage,
        dateCreated: admin.firestore.Timestamp.now(),
        dateModified: admin.firestore.Timestamp.now(),
        price: req.body.price,
        userId: req.body.userId,
        buildName: req.body.name,
      };

      const userId = req.body.userId || "default";

      // Saving build to firestore under userId
      const buildRef = this.db.collection(userId).doc(buildId);
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
      const buildData: Partial<IBuildModel> = {
        PROCESSEUR: req.body.PROCESSEUR,
        REFROIDISSEMENT: req.body.REFROIDISSEMENT,
        "CARTE MÈRE": req.body.CARTE_MERE,
        "BARETTE MÉMOIRE": req.body.BARETTE_MEMOIRE,
        ALIMENTATION: req.body.ALIMENTATION,
        "DISQUE-SSD": req.body.DISQUE_SSD,
        "DISQUE-HDD": req.body.DISQUE_HDD,
        "DISQUE-NVME": req.body.DISQUE_NVME,
        VENTILATEUR: req.body.VENTILATEUR,
        "CARTE GRAPHIQUE": req.body.CARTE_GRAPHIQUE,
        dateModified: admin.firestore.Timestamp.now(),
        price: req.body.price,
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
