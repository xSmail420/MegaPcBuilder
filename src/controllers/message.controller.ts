import {Request, Response} from 'express'
import { v4 as uuidv4} from 'uuid'
import {Firestore} from '@google-cloud/firestore'
import * as admin from 'firebase-admin'
import {MessageModel} from '../models/message.model'
import { ChatroomModel } from '../models/chatroom.model'
import { ResponseUtils } from '../utils/response.utils'
import { LangChainUtils } from '../utils/langchain.utils'

export class MessageController{
    constructor(private db: Firestore){}

    /**
     * @openapi
     * components:
     *  schemas:
     *      CreateMessageRequest:
     *          type: object
     *          properties:
     *              sender:
     *                  type: string
     *              content:
     *                  type: string
     */
    async addMessage(req: Request, res: Response){
        try {
            const chatroomId = req.params.chatroom_id

            if (!chatroomId){
                return ResponseUtils.sendErrorResponse(res, 400, 'Chatroom id is required', null)
            }
            const { sender, content } = req.body
            const messageData: MessageModel = {
                message_id: uuidv4(),
                sender,
                content,
                dateCreated: admin.firestore.Timestamp.now()
            }
            const chatroomRef= this.db.collection('chatrooms').doc(chatroomId)
            await chatroomRef.update({
                messages: admin.firestore.FieldValue.arrayUnion(messageData)
            })

            const userId = (await chatroomRef.get()).data()!.user_id
            
            const contentResponse = await LangChainUtils.getResponse(this.db, content, userId, chatroomId)
            if (contentResponse === ""){
                return ResponseUtils.sendErrorResponse(res, 400, 'Failed to get response from language chain', null)
            }

            const chatGPTResponse: MessageModel = {
                message_id: uuidv4(),
                sender: "AstroBot",
                content: contentResponse,
                dateCreated: admin.firestore.Timestamp.now() 
            }
            await chatroomRef.update({
                messages: admin.firestore.FieldValue.arrayUnion(chatGPTResponse)
            })
            return ResponseUtils.sendSuccessResponse(res, 200, 'Message added successfully', chatGPTResponse)
        } catch (error) {
            return ResponseUtils.sendErrorResponse(res, 500, 'Failed to add message', error)
        }
    }

    async deleteMessage(req: Request, res: Response){
        try {
            const chatroomId = req.params.chatroom_id
            const messageId = req.params.message_id;
            const chatroomRef = this.db.collection('chatrooms').doc(chatroomId)
    
            const chatroomDoc = await chatroomRef.get()
            if (!chatroomDoc.exists) {
                return ResponseUtils.sendErrorResponse(res, 404, 'Chatroom not found', null)
            }
    
            const chatroomData = chatroomDoc.data() as ChatroomModel;
            const updatedMessages = chatroomData.messages.filter((message) => message.message_id !== messageId)
      
            await chatroomRef.update({ messages: updatedMessages })
            return ResponseUtils.sendSuccessResponse(res, 200, 'Message deleted successfully', updatedMessages)
        } catch (error) {
            return ResponseUtils.sendErrorResponse(res, 500, 'Failed to delete message', error)
        
        }
    }

    async updateMessage(req: Request, res: Response){
        try {
            const chatroomId = req.params.chatroom_id
            const messageId = req.params.message_id
            const { content } = req.body

            const chatroomRef = this.db.collection('chatrooms').doc(chatroomId)
            const chatroomDoc = await chatroomRef.get()

            if (!chatroomDoc.exists) {
                return ResponseUtils.sendErrorResponse(res, 404, 'Chatroom not found', null)
            }

            const chatroomData = chatroomDoc.data() as ChatroomModel
            const updatedMessages = chatroomData.messages.map((message) => {
                if (message.message_id === messageId) {
                    return { ...message, content }
                }
                return message
            })

            await chatroomRef.update({ messages: updatedMessages })
            return ResponseUtils.sendSuccessResponse(res, 200, 'Message updated successfully', updatedMessages)
        } catch (error) {
            return ResponseUtils.sendErrorResponse(res, 500, 'Failed to update message', error)
        }
    }

    async showMessageData(req: Request, res: Response){
        try {
            const chatroomId = req.params.chatroom_id
            const messageId = req.params.message_id

            const chatroomRef = this.db.collection('chatrooms').doc(chatroomId)
            const chatroomDoc = await chatroomRef.get()

            if (!chatroomDoc.exists) {
                return ResponseUtils.sendErrorResponse(res, 404, 'Chatroom not found', null)
            }

            const chatroomData = chatroomDoc.data() as ChatroomModel
            const message = chatroomData.messages.find((message) => message.message_id === messageId)

            if (!message) {
                return ResponseUtils.sendErrorResponse(res, 404, 'Message not found', null)
            }

            return ResponseUtils.sendSuccessResponse(res, 200, 'Message found', message)
        } catch (error) {
            return ResponseUtils.sendErrorResponse(res, 500, 'Failed to retrieve message', error)
        }
    
    }
}