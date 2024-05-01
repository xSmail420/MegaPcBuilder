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

      // Filter components by budget
      const filteredComponents = await filterComponentsByBudget(
        userInput.budget,
        this.db
      );

      // Generate computer build using OpenAI API and filteredComponents as context
      const generatedBuild = await generateComputerBuild(
        filteredComponents,
        userInput
      );

      // Create build data
      const buildId = uuidv4();

      // Process and clean OpenAI LLM response
      const cleanedJsonString = generatedBuild.trim().replace(/'/g, '"');

      // Parse the JSON string into an object
      const buildData: Partial<BuildModel> = JSON.parse(cleanedJsonString);

      // Initialize fullBuildData with buildId
      const fullBuildData: Partial<IBuildModel> = {
        buildId: buildId,
        dateCreated: admin.firestore.Timestamp.now(),
      };
      // Extract components in buildData out of filteredComponents
      for (const key of componentTypes) {
        let componentKey = key;
        if (["DISQUE-SSD", "DISQUE-HDD", "DISQUE-NVME"].includes(key)) {
          componentKey = "STORAGE";
        }

        const component = buildData[componentKey as keyof BuildDataModel];

        if (component && component.lien) {
          const componentLien = component.lien;
          let matchingComponent;
          let dataComponent;
          for (let item of filteredComponents[key]) {
            if (
              item.lien.replace(/-/g, " ").toLowerCase() ===
              componentLien.replace(/-/g, " ").toLowerCase()
            ) {
              matchingComponent = item;
              break;
            }
          }
          if (!matchingComponent) {
            continue;
          }
          dataComponent = await getComponentData(
            matchingComponent.lien,
            this.db
          );
          if (dataComponent) {
            // Assuming you want to take the first matching component
            fullBuildData[componentKey as keyof BuildExampleModel] =
              dataComponent;
          }
        }
      }

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
        dateCreated: admin.firestore.Timestamp.now(),
      };

      // Saving build to firestore
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
      const buildData: Partial<IBuildModel> = {
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
