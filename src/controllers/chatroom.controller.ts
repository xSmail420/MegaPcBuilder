import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as admin from "firebase-admin";
import { Firestore } from "@google-cloud/firestore";
import { ChatroomModel } from "../models/chatroom.model";
import { MessageModel } from "../models/message.model";
import { ResponseUtils } from "../utils/response.utils";

export class ChatroomController {
  constructor(private db: Firestore) {}

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
  async createChatroom(req: Request, res: Response) {
    try {
      const chatroomData: ChatroomModel = {
        chatroom_id: uuidv4(),
        user_id: req.body.user_id,
        theme: req.body.theme,
        dateCreated: admin.firestore.Timestamp.now(),
        messages: [] as MessageModel[],
      };
      const chatroomRef = this.db
        .collection("chatrooms")
        .doc(chatroomData.chatroom_id);
      await chatroomRef.set(chatroomData);

      // Updating user document to include the chatroomID
      const userRef = this.db.collection("users").doc(req.body.user_id);
      await userRef.update({
        chatrooms: admin.firestore.FieldValue.arrayUnion(
          chatroomData.chatroom_id
        ),
      });

      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Chatroom created successfully",
        chatroomData
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to create chatroom",
        error
      );
    }
  }

  async deleteChatroom(req: Request, res: Response) {
    try {
      const chatroomId = req.params.chatroom_id;
      const chatroomRef = this.db.collection("chatrooms").doc(chatroomId);

      const chatroomDoc = await chatroomRef.get();
      if (!chatroomDoc.exists) {
        return ResponseUtils.sendErrorResponse(
          res,
          404,
          "Chatroom not found",
          null
        );
      }

      await chatroomRef.delete();

      // Remove chatroom ID from user document
      const usersRef = this.db.collection("users");
      const querySnapshot = await usersRef
        .where("chatrooms", "array-contains", chatroomId)
        .get();

      const batch = this.db.batch();
      querySnapshot.forEach((doc) => {
        const userRef = usersRef.doc(doc.id);
        batch.update(userRef, {
          chatrooms: admin.firestore.FieldValue.arrayRemove(chatroomId),
        });
      });

      await batch.commit();
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Chatroom deleted successfully",
        chatroomDoc.data()
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to delete chatroom",
        error
      );
    }
  }

  async updateChatroom(req: Request, res: Response) {
    try {
      const chatroomData: ChatroomModel = {
        chatroom_id: req.params.chatroom_id,
        user_id: req.body.user_id,
        theme: req.body.theme,
        dateCreated: admin.firestore.Timestamp.now(),
        messages: req.body.messages,
      };

      const chatroomRef = this.db
        .collection("chatrooms")
        .doc(chatroomData.chatroom_id);
      const chatroomDoc = await chatroomRef.get();

      if (!chatroomDoc.exists) {
        return ResponseUtils.sendErrorResponse(
          res,
          404,
          "Chatroom not found",
          null
        );
      }

      await chatroomRef.update(chatroomData as { [x: string]: any });
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Chatroom updated successfully",
        chatroomDoc.data()
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to update chatroom",
        error
      );
    }
  }

  async showChatroomData(req: Request, res: Response) {
    try {
      const chatroomId = req.params.chatroom_id;
      const chatroomRef = this.db.collection("chatrooms").doc(chatroomId);
      const chatroomDoc = await chatroomRef.get();

      if (!chatroomDoc.exists) {
        return ResponseUtils.sendErrorResponse(
          res,
          404,
          "Chatroom not found",
          null
        );
      }

      const chatroomData = chatroomDoc.data() as ChatroomModel;
      const formattedMessages = chatroomData.messages.map((message) => {
        const dateCreated = new Date(
          message.dateCreated.seconds * 1000 +
            message.dateCreated.nanoseconds / 1000000
        );
        return { ...message, dateCreated };
      });

      const formattedChatroomData = {
        ...chatroomData,
        messages: formattedMessages,
      };
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Chatroom data retrieved successfully",
        formattedChatroomData
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to retrieve chatroom data",
        error
      );
    }
  }

  async showChatroomDataByUserId(req: Request, res: Response) {
    try {
      const userId = req.params.user_id;
      const chatroomRef = this.db.collection("chatrooms");
      const chatroomSnapshot = await chatroomRef
        .where("user_id", "==", userId)
        .get();
      const chatroomData: ChatroomModel[] = chatroomSnapshot.docs.map(
        (doc) => doc.data() as ChatroomModel
      );
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Chatroom data retrieved successfully",
        chatroomData
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to retrieve chatroom data",
        error
      );
    }
  }

  async showAllChatroomData(req: Request, res: Response) {
    try {
      const chatroomRef = this.db.collection("chatrooms");
      const chatroomSnapshot = await chatroomRef.get();
      const chatroomData: ChatroomModel[] = chatroomSnapshot.docs.map(
        (doc) => doc.data() as ChatroomModel
      );
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "Chatroom data retrieved successfully",
        chatroomData
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to retrieve chatroom data",
        error
      );
    }
  }

  async deleteAllChatroom(req: Request, res: Response) {
    try {
      const userId = req.params.user_id;
      const chatroomRef = this.db.collection("chatrooms");
      const chatroomSnapshot = await chatroomRef
        .where("user_id", "==", userId)
        .get();
      const batch = this.db.batch();
      chatroomSnapshot.forEach((doc) => {
        const chatroom = chatroomRef.doc(doc.id);
        batch.delete(chatroom);
      });

      // Update user's chatroom data to empty array
      const userRef = this.db.collection("users").doc(userId);
      batch.update(userRef, { chatrooms: [] });

      await batch.commit();
      return ResponseUtils.sendSuccessResponse(
        res,
        200,
        "All chatrooms deleted successfully",
        null
      );
    } catch (error: any) {
      return ResponseUtils.sendErrorResponse(
        res,
        500,
        "Failed to delete all chatrooms",
        error
      );
    }
  }
}
