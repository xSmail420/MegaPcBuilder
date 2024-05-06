import * as admin from "firebase-admin";
import { ComponentModel } from "./component.module";

/**
 * @openapi
 * definitions:
 *  BuildModel:
 *      properties:
 *          PROCESSEUR:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/ComponentModel'
 *          REFROIDISSEMENT:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/ComponentModel'
 *          CARTE_MERE:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/ComponentModel'
 *          BARETTE_MEMOIRE:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/ComponentModel'
 *          ALIMENTATION:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/ComponentModel'
 *          DISQUE_SSD:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/ComponentModel'
 *          DISQUE_HDD:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/ComponentModel'
 *          DISQUE_NVME:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/ComponentModel'
 *          VENTILATEUR:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/ComponentModel'
 *          CARTE_GRAPHIQUE:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/ComponentModel'
 */

export interface BuildModel extends BuildDataModel {
  buildId: string;
  dateCreated: admin.firestore.Timestamp;
}

export interface BuildDataModel {
  PROCESSEUR?: Partial<ComponentModel>;
  REFROIDISSEMENT?: Partial<ComponentModel>;
  "CARTE MÈRE"?: Partial<ComponentModel>;
  "BARETTE MÉMOIRE"?: Partial<ComponentModel>;
  ALIMENTATION?: Partial<ComponentModel>;
  "DISQUE-SSD"?: Partial<ComponentModel>;
  "DISQUE-HDD"?: Partial<ComponentModel>;
  "DISQUE-NVME"?: Partial<ComponentModel>;
  STORAGE?: Partial<ComponentModel>;
  VENTILATEUR?: Partial<ComponentModel>;
  "CARTE GRAPHIQUE"?: Partial<ComponentModel>;
  BOITIER?: Partial<ComponentModel>;
}
export interface BuildExampleModel {
  PROCESSEUR?: any;
  REFROIDISSEMENT?: any;
  "CARTE MÈRE"?: any;
  "BARETTE MÉMOIRE"?: any;
  ALIMENTATION?: any;
  "DISQUE-SSD"?: any;
  "DISQUE-HDD"?: any;
  "DISQUE-NVME"?: any;
  STORAGE?: any;
  VENTILATEUR?: any;
  "CARTE GRAPHIQUE"?: any;
  BOITIER?: any;
}

export interface IBuildModel extends BuildExampleModel {
  buildId: string;
  dateCreated: admin.firestore.Timestamp;
  price?: number;
  dateModified? : admin.firestore.Timestamp;
  userId?: string;
  buildName?: string;
}
