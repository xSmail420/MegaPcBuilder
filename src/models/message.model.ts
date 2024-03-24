import * as admin from 'firebase-admin'

/**
 * @openapi
 * definitions:
 *  MessageModel:
 *      properties:
 *          message_id:
 *              type: string
 *          sender:
 *              type: string
 *          content:
 *              type: string
 *          dateCreated:
 *              type: string
 */
export interface MessageModel {
    message_id: string,
    sender: string,
    content: string,
    dateCreated: admin.firestore.Timestamp,
}