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

export interface BuildModel {
  buildId: string;
  PROCESSEUR?: Partial<ComponentModel>[];
  REFROIDISSEMENT?: Partial<ComponentModel>[];
  CARTE_MERE?: Partial<ComponentModel>[];
  BARETTE_MEMOIRE?: Partial<ComponentModel>[];
  ALIMENTATION?: Partial<ComponentModel>[];
  DISQUE_SSD?: Partial<ComponentModel>[];
  DISQUE_HDD?: Partial<ComponentModel>[];
  DISQUE_NVME?: Partial<ComponentModel>[];
  VENTILATEUR?: Partial<ComponentModel>[];
  CARTE_GRAPHIQUE?: Partial<ComponentModel>[];
  dateCreated: admin.firestore.Timestamp;
}
