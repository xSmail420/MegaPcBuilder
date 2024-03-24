"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const uuid_1 = require("uuid");
const admin = __importStar(require("firebase-admin"));
const response_utils_1 = require("../utils/response.utils");
const langchain_utils_1 = require("../utils/langchain.utils");
class MessageController {
    constructor(db) {
        this.db = db;
    }
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
    async addMessage(req, res) {
        try {
            const chatroomId = req.params.chatroom_id;
            if (!chatroomId) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 400, 'Chatroom id is required', null);
            }
            const { sender, content } = req.body;
            const messageData = {
                message_id: (0, uuid_1.v4)(),
                sender,
                content,
                dateCreated: admin.firestore.Timestamp.now()
            };
            const chatroomRef = this.db.collection('chatrooms').doc(chatroomId);
            await chatroomRef.update({
                messages: admin.firestore.FieldValue.arrayUnion(messageData)
            });
            const userId = (await chatroomRef.get()).data().user_id;
            const contentResponse = await langchain_utils_1.LangChainUtils.getResponse(this.db, content, userId, chatroomId);
            if (contentResponse === "") {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 400, 'Failed to get response from language chain', null);
            }
            const chatGPTResponse = {
                message_id: (0, uuid_1.v4)(),
                sender: "AstroBot",
                content: contentResponse,
                dateCreated: admin.firestore.Timestamp.now()
            };
            await chatroomRef.update({
                messages: admin.firestore.FieldValue.arrayUnion(chatGPTResponse)
            });
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, 'Message added successfully', chatGPTResponse);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, 'Failed to add message', error);
        }
    }
    async deleteMessage(req, res) {
        try {
            const chatroomId = req.params.chatroom_id;
            const messageId = req.params.message_id;
            const chatroomRef = this.db.collection('chatrooms').doc(chatroomId);
            const chatroomDoc = await chatroomRef.get();
            if (!chatroomDoc.exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 404, 'Chatroom not found', null);
            }
            const chatroomData = chatroomDoc.data();
            const updatedMessages = chatroomData.messages.filter((message) => message.message_id !== messageId);
            await chatroomRef.update({ messages: updatedMessages });
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, 'Message deleted successfully', updatedMessages);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, 'Failed to delete message', error);
        }
    }
    async updateMessage(req, res) {
        try {
            const chatroomId = req.params.chatroom_id;
            const messageId = req.params.message_id;
            const { content } = req.body;
            const chatroomRef = this.db.collection('chatrooms').doc(chatroomId);
            const chatroomDoc = await chatroomRef.get();
            if (!chatroomDoc.exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 404, 'Chatroom not found', null);
            }
            const chatroomData = chatroomDoc.data();
            const updatedMessages = chatroomData.messages.map((message) => {
                if (message.message_id === messageId) {
                    return Object.assign(Object.assign({}, message), { content });
                }
                return message;
            });
            await chatroomRef.update({ messages: updatedMessages });
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, 'Message updated successfully', updatedMessages);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, 'Failed to update message', error);
        }
    }
    async showMessageData(req, res) {
        try {
            const chatroomId = req.params.chatroom_id;
            const messageId = req.params.message_id;
            const chatroomRef = this.db.collection('chatrooms').doc(chatroomId);
            const chatroomDoc = await chatroomRef.get();
            if (!chatroomDoc.exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 404, 'Chatroom not found', null);
            }
            const chatroomData = chatroomDoc.data();
            const message = chatroomData.messages.find((message) => message.message_id === messageId);
            if (!message) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 404, 'Message not found', null);
            }
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, 'Message found', message);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, 'Failed to retrieve message', error);
        }
    }
}
exports.MessageController = MessageController;
