/**
 * @openapi
 * definitions:
 *  ComponentModel:
 *      properties:
 *          title_fr:
 *              type: string
 *          price:
 *              type: number
 *          stock:
 *              type: number
 *          lien:
 *              type: string
 *          nFilsCategs:
 *              type: string
 *          attributes:
 *              type: object
 *              additionalProperties:
 *                  type: string
 */

export interface ComponentModel {
  title_fr: string;
  price: number;
  stock: number;
  lien?: string;
  nFilsCategs?: string;
  attributes?: { [key: string]: string };
}
