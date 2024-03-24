"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const uuid_1 = require("uuid");
const response_utils_1 = require("../utils/response.utils");
class UserController {
    constructor(db) {
        this.db = db;
    }
    /**
     * @openapi
     * components:
     *  schemas:
     *      UserRequest:
     *          type: object
     *          required:
     *              - name
     *              - age
     *              - gender
     *              - occupation
     *              - location
     *          properties:
     *              name:
     *                  type: string
     *              age:
     *                  type: number
     *              gender:
     *                  type: string
     *              occupation:
     *                  type: string
     *              location:
     *                  type: string
     */
    async createUser(req, res) {
        try {
            const personalisation_id = (0, uuid_1.v4)();
            const userId = (0, uuid_1.v4)();
            const newUser = {
                user_id: userId,
                name: req.body.name,
                age: req.body.age,
                gender: req.body.gender,
                occupation: req.body.occupation,
                location: req.body.location,
                personalisation_id: personalisation_id,
                chatrooms: []
            };
            const userPersonalisationRef = this.db.collection('userPersonalisation').doc(personalisation_id);
            await userPersonalisationRef.set({
                personalisation_id: personalisation_id,
                user_id: userId,
                answers: [],
                summary: ""
            });
            const userRef = this.db.collection('users').doc(newUser.user_id);
            await userRef.set(newUser);
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, `User created successfully`, newUser);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, `Failed to create user`, error);
        }
    }
    async deleteUser(req, res) {
        var _a, _b;
        try {
            const userId = req.params.user_id;
            const userRef = this.db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 404, `User not found`, null);
            }
            else {
                // Delete the user from all chatrooms they are a member of
                const userChatrooms = ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.chatrooms) || [];
                for (const chatroomId of userChatrooms) {
                    await this.deleteChatroom(chatroomId, this.db);
                }
                await this.deletePersonalisation((_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.personalisation_id, this.db);
                await userRef.delete();
                return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, `User and associated chatrooms deleted successfully`, null);
            }
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, `Failed to delete user`, error);
        }
    }
    async deleteChatroom(chatroomId, db) {
        const chatroomRef = db.collection('chatrooms').doc(chatroomId);
        const chatroomDoc = await chatroomRef.get();
        if (!chatroomDoc.exists) {
            throw new Error(`Chatroom ${chatroomId} not found`);
        }
        // Delete the chatroom
        await chatroomRef.delete();
    }
    async deletePersonalisation(personalisationId, db) {
        const personalisationRef = db.collection('userPersonalisation').doc(personalisationId);
        const personalisationDoc = await personalisationRef.get();
        if (!personalisationDoc.exists) {
            throw new Error(`Personalisation ${personalisationId} not found`);
        }
        // Delete the personalisation
        await personalisationRef.delete();
    }
    async updateUser(req, res) {
        try {
            const userId = req.params.user_id;
            const updatedData = {
                name: req.body.name,
                age: req.body.age,
                gender: req.body.gender,
                occupation: req.body.occupation,
                location: req.body.location,
            };
            const userRef = this.db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 404, `User not found`, null);
            }
            await userRef.update(updatedData);
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, `User updated successfully`, updatedData);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, `Failed to update user`, error);
        }
    }
    async showUserData(req, res) {
        try {
            const user_id = req.params.user_id;
            const userRef = this.db.collection('users').doc(user_id);
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 404, `User not found`, null);
            }
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, `User fetched successfully`, userDoc.data());
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, `Failed to fetch user`, error);
        }
    }
    async showAllUserData(req, res) {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            const users = [];
            usersSnapshot.forEach((doc) => {
                users.push(doc.data());
            });
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, `Users fetched successfully`, users);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, `Failed to fetch users`, error);
        }
    }
}
exports.UserController = UserController;
