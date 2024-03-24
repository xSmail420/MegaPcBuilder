import {Request, Response} from 'express'
import { v4 as uuidv4} from 'uuid'
import {Firestore} from '@google-cloud/firestore'
import { UserModel } from '../models/user.model'
import { ResponseUtils } from '../utils/response.utils'


export class UserController{

    constructor(private db: Firestore){
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
    async createUser(req: Request, res: Response){
        try {
            const personalisation_id = uuidv4()
            const userId = uuidv4()
            const newUser: UserModel = {
              user_id: userId,
              name: req.body.name,
              age: req.body.age,
              gender: req.body.gender,
              occupation: req.body.occupation,
              location: req.body.location,
              personalisation_id: personalisation_id,
              chatrooms: []
            }

            const userPersonalisationRef = this.db.collection('userPersonalisation').doc(personalisation_id)
            await userPersonalisationRef.set({
                personalisation_id: personalisation_id,
                user_id: userId,
                answers: [],
                summary: ""
            })

            const userRef = this.db.collection('users').doc(newUser.user_id)
            await userRef.set(newUser)

            return ResponseUtils.sendSuccessResponse(res, 200, `User created successfully`, newUser)
          } catch (error: any) {
            return ResponseUtils.sendErrorResponse(res, 500, `Failed to create user`, error)
          
          }
    }

    async deleteUser(req: Request, res: Response){
        try {
            const userId = req.params.user_id
            const userRef = this.db.collection('users').doc(userId)
            const userDoc = await userRef.get()   
  
            if (!userDoc.exists) {
                return ResponseUtils.sendErrorResponse(res, 404, `User not found`, null)
            } else {
            // Delete the user from all chatrooms they are a member of
                const userChatrooms = userDoc.data()?.chatrooms || []
                for (const chatroomId of userChatrooms) {
                    await this.deleteChatroom(chatroomId, this.db)
                }
                await this.deletePersonalisation(userDoc.data()?.personalisation_id, this.db)
                await userRef.delete()
                return ResponseUtils.sendSuccessResponse(res, 200, `User and associated chatrooms deleted successfully`, null)
            }
        } catch (error: any) {
            return ResponseUtils.sendErrorResponse(res, 500, `Failed to delete user`, error)
        }
    }

    async deleteChatroom(chatroomId: string, db: Firestore) {
        const chatroomRef = db.collection('chatrooms').doc(chatroomId)
        const chatroomDoc = await chatroomRef.get()
    
        if (!chatroomDoc.exists) {
            throw new Error(`Chatroom ${chatroomId} not found`)
        }
    
        // Delete the chatroom
        await chatroomRef.delete()
    }

    async deletePersonalisation(personalisationId: string, db: Firestore) {
        const personalisationRef = db.collection('userPersonalisation').doc(personalisationId)
        const personalisationDoc = await personalisationRef.get()
        if (!personalisationDoc.exists) {
            throw new Error(`Personalisation ${personalisationId} not found`)
        }

        // Delete the personalisation
        await personalisationRef.delete()
    }
    
    async updateUser(req: Request, res: Response){
        try {
            const userId = req.params.user_id;
            const updatedData = {
                name: req.body.name,
                age: req.body.age,
                gender: req.body.gender,
                occupation: req.body.occupation,
                location: req.body.location,
            }
            const userRef = this.db.collection('users').doc(userId)
            const userDoc = await userRef.get()
    
            if (!userDoc.exists) {
                return ResponseUtils.sendErrorResponse(res, 404, `User not found`, null)
            }
            
            await userRef.update(updatedData)
            return ResponseUtils.sendSuccessResponse(res, 200, `User updated successfully`, updatedData)

        } catch (error: any) {
            return ResponseUtils.sendErrorResponse(res, 500, `Failed to update user`, error)
        
        } 
    }

    async showUserData(req: Request, res: Response){
        try{
            const user_id = req.params.user_id
            const userRef = this.db.collection('users').doc(user_id)
            const userDoc = await userRef.get()

            if (!userDoc.exists) {
                return ResponseUtils.sendErrorResponse(res, 404, `User not found`, null)
            }

            return ResponseUtils.sendSuccessResponse(res, 200, `User fetched successfully`, userDoc.data())
        } catch (error) {
            return ResponseUtils.sendErrorResponse(res, 500, `Failed to fetch user`, error)
        }
    }

    async showAllUserData(req: Request, res: Response){
        try {
            const usersSnapshot = await this.db.collection('users').get()
            const users: any[] = []
    
            usersSnapshot.forEach((doc) => {
                users.push(doc.data())
            })
    
            return ResponseUtils.sendSuccessResponse(res, 200, `Users fetched successfully`, users)
        } catch (error: any) {
            return ResponseUtils.sendErrorResponse(res, 500, `Failed to fetch users`, error)
        
        }
    
    }
}
