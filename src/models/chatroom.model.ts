import {MessageModel} from './message.model'
import * as admin from 'firebase-admin'

/**
 * @openapi
 * definitions:
 *  ChatroomModel:
 *      properties:
 *          chatroom_id:
 *              type: string
 *          user_id:
 *              type: string
 *          theme:
 *              type: string
 *          messages:
 *              type: array
 *              items:
 *                  $ref: '#/definitions/MessageModel'
 */

export interface ChatroomModel {
    chatroom_id: string,
    user_id: string,
    theme: string,
    dateCreated: admin.firestore.Timestamp,
    messages: MessageModel[],
}