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
exports.ChatroomController = void 0;
const uuid_1 = require("uuid");
const admin = __importStar(require("firebase-admin"));
const response_utils_1 = require("../utils/response.utils");
class ChatroomController {
    constructor(db) {
        this.db = db;
    }
    /**
     * @openapi
     * components:
     *  schemas:
     *      CreateChatroomRequest:
     *          type: object
     *          required:
     *              - user_id
     *              - theme
     *          properties:
     *              user_id:
     *                  type: string
     *              theme:
     *                  type: string
     *      UpdateChatroomRequest:
     *          type: object
     *          required:
     *              - user_id
     *              - theme
     *              - messages
     *          properties:
     *              user_id:
     *                  type: string
     *              theme:
     *                  type: string
     *              messages:
     *                  type: array
     *                  items:
     *                      $ref: '#/definitions/MessageModel'
     */
    async createChatroom(req, res) {
        try {
            const chatroomData = {
                chatroom_id: (0, uuid_1.v4)(),
                user_id: req.body.user_id,
                theme: req.body.theme,
                dateCreated: admin.firestore.Timestamp.now(),
                messages: [],
            };
            const chatroomRef = this.db.collection('chatrooms').doc(chatroomData.chatroom_id);
            await chatroomRef.set(chatroomData);
            // Updating user document to include the chatroomID
            const userRef = this.db.collection('users').doc(req.body.user_id);
            await userRef.update({
                chatrooms: admin.firestore.FieldValue.arrayUnion(chatroomData.chatroom_id)
            });
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, "Chatroom created successfully", chatroomData);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to create chatroom", error);
        }
    }
    async deleteChatroom(req, res) {
        try {
            const chatroomId = req.params.chatroom_id;
            const chatroomRef = this.db.collection('chatrooms').doc(chatroomId);
            const chatroomDoc = await chatroomRef.get();
            if (!chatroomDoc.exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 404, "Chatroom not found", null);
            }
            await chatroomRef.delete();
            // Remove chatroom ID from user document
            const usersRef = this.db.collection('users');
            const querySnapshot = await usersRef.where('chatrooms', 'array-contains', chatroomId).get();
            const batch = this.db.batch();
            querySnapshot.forEach((doc) => {
                const userRef = usersRef.doc(doc.id);
                batch.update(userRef, {
                    chatrooms: admin.firestore.FieldValue.arrayRemove(chatroomId),
                });
            });
            await batch.commit();
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, "Chatroom deleted successfully", chatroomDoc.data());
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to delete chatroom", error);
        }
    }
    async updateChatroom(req, res) {
        try {
            const chatroomData = {
                chatroom_id: req.params.chatroom_id,
                user_id: req.body.user_id,
                theme: req.body.theme,
                dateCreated: admin.firestore.Timestamp.now(),
                messages: req.body.messages,
            };
            const chatroomRef = this.db.collection('chatrooms').doc(chatroomData.chatroom_id);
            const chatroomDoc = await chatroomRef.get();
            if (!chatroomDoc.exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 404, "Chatroom not found", null);
            }
            await chatroomRef.update(chatroomData);
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, "Chatroom updated successfully", chatroomDoc.data());
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to update chatroom", error);
        }
    }
    async showChatroomData(req, res) {
        try {
            const chatroomId = req.params.chatroom_id;
            const chatroomRef = this.db.collection('chatrooms').doc(chatroomId);
            const chatroomDoc = await chatroomRef.get();
            if (!chatroomDoc.exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 404, "Chatroom not found", null);
            }
            const chatroomData = chatroomDoc.data();
            const formattedMessages = chatroomData.messages.map((message) => {
                const dateCreated = new Date(message.dateCreated.seconds * 1000 + message.dateCreated.nanoseconds / 1000000);
                return Object.assign(Object.assign({}, message), { dateCreated });
            });
            const formattedChatroomData = Object.assign(Object.assign({}, chatroomData), { messages: formattedMessages });
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, "Chatroom data retrieved successfully", formattedChatroomData);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to retrieve chatroom data", error);
        }
    }
    async showChatroomDataByUserId(req, res) {
        try {
            const userId = req.params.user_id;
            const chatroomRef = this.db.collection('chatrooms');
            const chatroomSnapshot = await chatroomRef.where('user_id', '==', userId).get();
            const chatroomData = chatroomSnapshot.docs.map((doc) => doc.data());
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, "Chatroom data retrieved successfully", chatroomData);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to retrieve chatroom data", error);
        }
    }
    async showAllChatroomData(req, res) {
        try {
            const chatroomRef = this.db.collection('chatrooms');
            const chatroomSnapshot = await chatroomRef.get();
            const chatroomData = chatroomSnapshot.docs.map((doc) => doc.data());
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, "Chatroom data retrieved successfully", chatroomData);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to retrieve chatroom data", error);
        }
    }
    async deleteAllChatroom(req, res) {
        try {
            const userId = req.params.user_id;
            const chatroomRef = this.db.collection('chatrooms');
            const chatroomSnapshot = await chatroomRef.where('user_id', '==', userId).get();
            const batch = this.db.batch();
            chatroomSnapshot.forEach((doc) => {
                const chatroom = chatroomRef.doc(doc.id);
                batch.delete(chatroom);
            });
            // Update user's chatroom data to empty array
            const userRef = this.db.collection('users').doc(userId);
            batch.update(userRef, { chatrooms: [] });
            await batch.commit();
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, "All chatrooms deleted successfully", null);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to delete all chatrooms", error);
        }
    }
}
exports.ChatroomController = ChatroomController;
