"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPersonalisationController = void 0;
const response_utils_1 = require("../utils/response.utils");
const uuid_1 = require("uuid");
/**
 * @openapi
 * components:
 *  schemas:
 *    PersonalisationRequest:
 *      type: object
 *      properties:
 *        answers:
 *          type: array
 *          items:
 *            $ref: '#/definitions/QuestionAnswer'
 */
class UserPersonalisationController {
    constructor(db) {
        this.db = db;
    }
    async createUserPersonalisation(req, res) {
        var _a;
        try {
            const userId = req.params.user_id;
            const personalisationData = req.body;
            const userRef = this.db.collection('users').doc(userId);
            if (!(await userRef.get()).exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 400, "User does not exist", userId);
            }
            if ((_a = (await userRef.get()).data()) === null || _a === void 0 ? void 0 : _a.personalisation_id) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 400, "User already has personalisation", userId);
            }
            const newUUID = (0, uuid_1.v4)();
            const userPersonalisationRef = this.db.collection('userPersonalisation').doc(newUUID);
            if (!personalisationData || !personalisationData.answers || personalisationData.answers.length !== 19) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 400, "Invalid personalisation data", personalisationData);
            }
            await userPersonalisationRef.set({ answers: personalisationData.answers });
            await userRef.update({ personalisation_id: newUUID });
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, "Successfully created user personalisation", (await userPersonalisationRef.get()).data());
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to create user personalisation", error);
        }
    }
    async saveUserPersonalisation(req, res) {
        try {
            const userId = req.params.user_id;
            const personalisationData = req.body;
            const userDoc = this.db.collection('users').doc(userId);
            const userDocSnapshot = await userDoc.get();
            const personalisationId = userDocSnapshot.get("personalisation_id");
            if (!personalisationData || !personalisationData.answers || personalisationData.answers.length !== 19) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 400, "Invalid personalisation data", personalisationData);
            }
            const userPersonalisationRef = this.db.collection('userPersonalisation').doc(personalisationId);
            const userPersonalisationSnapshot = await userPersonalisationRef.get();
            if (!userPersonalisationSnapshot.exists) {
                await userPersonalisationRef.set({ answers: personalisationData.answers });
            }
            else {
                await userPersonalisationRef.update({
                    answers: personalisationData.answers
                });
            }
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, "Successfully updated user personalisation", (await userPersonalisationRef.get()).data());
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to update user personalisation", error);
        }
    }
    async deleteUserPersonalisation(req, res) {
        var _a;
        try {
            const userId = req.params.user_id;
            const userRef = this.db.collection('users').doc(userId);
            if (!(await userRef.get()).exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 400, `User with id ${userId} does not exist`, null);
            }
            const personalisationId = (_a = (await userRef.get()).data()) === null || _a === void 0 ? void 0 : _a.personalisation_id;
            const userPersonalisationRef = this.db.collection('userPersonalisation').doc(personalisationId);
            await userPersonalisationRef.delete();
            await userRef.update({ personalisation_id: null });
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, `User personalisation deleted successfully`, null);
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to delete user personalisation", error);
        }
    }
    async getUserPersonalisation(req, res) {
        var _a, _b;
        try {
            const userId = req.params.user_id;
            const userRef = this.db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 400, `User with id ${userId} does not exist`, null);
            }
            if (((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.personalisation_id) === null) {
                return response_utils_1.ResponseUtils.sendErrorResponse(res, 400, `User with id ${userId} does not have a personalisation`, null);
            }
            const personalisationId = (_b = userDoc.data()) === null || _b === void 0 ? void 0 : _b.personalisation_id;
            const userPersonalisationRef = this.db.collection('userPersonalisation').doc(personalisationId);
            const userPersonalisationDoc = await userPersonalisationRef.get();
            return response_utils_1.ResponseUtils.sendSuccessResponse(res, 200, `User personalisation retrieved successfully`, userPersonalisationDoc.data());
        }
        catch (error) {
            return response_utils_1.ResponseUtils.sendErrorResponse(res, 500, "Failed to get user personalisation", error);
        }
    }
}
exports.UserPersonalisationController = UserPersonalisationController;
