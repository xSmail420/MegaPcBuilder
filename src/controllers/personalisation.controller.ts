import { Firestore } from '@google-cloud/firestore'
import { Request, Response } from 'express'
import { PersonalisationData } from '../models/personalisation.model'
import { ResponseUtils } from '../utils/response.utils'
import { v4 as uuidv4} from 'uuid'

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
export class UserPersonalisationController {
  constructor(private db: Firestore) {}

  async createUserPersonalisation(req: Request, res: Response) {
    try {
      const userId = req.params.user_id;
      const personalisationData: PersonalisationData = req.body;
      const userRef = this.db.collection('users').doc(userId);

      if (!(await userRef.get()).exists) {
        return ResponseUtils.sendErrorResponse(res, 400, "User does not exist", userId);
      }

      if ((await userRef.get()).data()?.personalisation_id) {
        return ResponseUtils.sendErrorResponse(res, 400, "User already has personalisation", userId);
      }

      const newUUID = uuidv4();
      const userPersonalisationRef = this.db.collection('userPersonalisation').doc(newUUID);

      if (!personalisationData || !personalisationData.answers || personalisationData.answers.length !== 19) {
        return ResponseUtils.sendErrorResponse(
          res,
          400,
          "Invalid personalisation data",
          personalisationData
        )
      }

      await userPersonalisationRef.set({ answers: personalisationData.answers })
      await userRef.update({ personalisation_id: newUUID })

      return ResponseUtils.sendSuccessResponse(res, 200, "Successfully created user personalisation", (await userPersonalisationRef.get()).data());
    } catch (error) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to create user personalisation",
        error
      )
    }
  }

  async saveUserPersonalisation(req: Request, res: Response) {
    try {
      const userId = req.params.user_id;
      const personalisationData: PersonalisationData = req.body;

      const userDoc = this.db.collection('users').doc(userId);
      const userDocSnapshot = await userDoc.get();
      const personalisationId = userDocSnapshot.get("personalisation_id");

      if (!personalisationData || !personalisationData.answers || personalisationData.answers.length !== 19) {
        return ResponseUtils.sendErrorResponse(
          res,
          400,
          "Invalid personalisation data",
          personalisationData
        );
      }
      const userPersonalisationRef = this.db.collection('userPersonalisation').doc(personalisationId);
      const userPersonalisationSnapshot = await userPersonalisationRef.get();

      if (!userPersonalisationSnapshot.exists) {
        await userPersonalisationRef.set({ answers: personalisationData.answers });
      } else {
        await userPersonalisationRef.update({
          answers: personalisationData.answers});
      }

      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Successfully updated user personalisation",
        (await userPersonalisationRef.get()).data()
      );

    } catch (error) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to update user personalisation",
        error
      )
    }
  }

  async deleteUserPersonalisation(req: Request, res: Response){
    try {
      const userId = req.params.user_id
      const userRef = this.db.collection('users').doc(userId)

      if (!(await userRef.get()).exists) {
        return ResponseUtils.sendErrorResponse(res, 400, `User with id ${userId} does not exist`, null)
      }
      
      const personalisationId = (await userRef.get()).data()?.personalisation_id
      const userPersonalisationRef = this.db.collection('userPersonalisation').doc(personalisationId)

      await userPersonalisationRef.delete()
      await userRef.update({ personalisation_id: null })
      return ResponseUtils.sendSuccessResponse(res, 200, `User personalisation deleted successfully`, null)
    } catch (error) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to delete user personalisation",
        error
      )
    }
  }

  async getUserPersonalisation(req: Request, res: Response) {
    try {
      const userId = req.params.user_id
      const userRef = this.db.collection('users').doc(userId)
      
      const userDoc = await userRef.get()

      if (!userDoc.exists){
        return ResponseUtils.sendErrorResponse(res, 400, `User with id ${userId} does not exist`, null)
      }

      if (userDoc.data()?.personalisation_id === null){
        return ResponseUtils.sendErrorResponse(res, 400, `User with id ${userId} does not have a personalisation`, null)
      }

      const personalisationId = userDoc.data()?.personalisation_id
      const userPersonalisationRef = this.db.collection('userPersonalisation').doc(personalisationId)
      const userPersonalisationDoc = await userPersonalisationRef.get()
      return ResponseUtils.sendSuccessResponse(res, 200, `User personalisation retrieved successfully`, userPersonalisationDoc.data())
    } catch (error) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to get user personalisation",
        error
      )
    }
  }
}
