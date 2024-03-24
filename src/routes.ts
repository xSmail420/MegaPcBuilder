import { Express } from 'express'
import { Firestore } from '@google-cloud/firestore'
import { MessageController } from './controllers/message.controller';
import { UserController } from './controllers/user.controller';
import { ChatroomController } from './controllers/chatroom.controller';
import { UserPersonalisationController } from './controllers/personalisation.controller';
import { BuildController } from './controllers/builder.controller';

function routes(app: Express, db: Firestore) {
  const userController = new UserController(db)
  const chatroomController = new ChatroomController(db)
  const messageController = new MessageController(db)
  const userPersonalisationController = new UserPersonalisationController(db)
  const buildController = new BuildController(db)

  /**
  
  /* User Routes */
  /**
   * @openapi
   * '/api/v1/healthcheck':
   *  get:
   *    tags: 
   *      - Healthcheck
   *    summary: Get the status of the server
   *    responses:
   *      200:
   *        description: Success
   */
  app.get('/api/v1/healthcheck', (req, res) => {
    res.sendStatus(200);
  })

  /* Chatroom Routes */
  /**
   * @openapi
   * '/api/v1/chatrooms/':
   *  post:
   *    tags:
   *      - Chatroom
   *    summary: Adding a chatroom to the db
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/CreateChatroomRequest'
   *    responses:
   *      200:
   *        description: Success
   */
  app.post('/api/v1/chatrooms', (req, res) => {
    chatroomController.createChatroom(req, res)
  })

  /**
   * @openapi
   * '/api/v1/chatrooms/{chatroom_id}':
   *  delete:
   *    tags: 
   *      - Chatroom
   *    summary: Delete data of a chatroom
   *    parameters:
   *      - name: chatroom_id
   *        in: path
   *        description: chatroom id
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */ 
  app.delete('/api/v1/chatrooms/:chatroom_id', (req, res) => {
    chatroomController.deleteChatroom(req, res)
  })

  /**
   * @openapi
   * '/api/v1/chatrooms/{chatroom_id}':
   *  put:
   *    tags: 
   *      - Chatroom
   *    summary: Update data of a chatroom
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/UpdateChatroomRequest'
   *    parameters:
   *      - name: chatroom_id
   *        in: path
   *        description: chatroom id
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */ 
  app.put('/api/v1/chatrooms/:chatroom_id', (req, res) => {
    chatroomController.updateChatroom(req, res)
  })

  /**
   * @openapi
   * '/api/v1/chatrooms/{chatroom_id}':
   *  get:
   *    tags:
   *      - Chatroom
   *    summary: Get data of a chatroom
   *    parameters:
   *      - name: chatroom_id
   *        in: path
   *        description: chatroom id
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */
  app.get('/api/v1/chatrooms/:chatroom_id', (req, res) => {
    chatroomController.showChatroomData(req, res)
  })

  /**
   * @openapi
   * '/api/v1/chatrooms/':
   *  get:
   *    tags:
   *      - Chatroom
   *    summary: Get all data of chatroom
   *    responses:
   *      200:
   *        description: Success
   */
  app.get('/api/v1/chatrooms/', (req, res) => {
    chatroomController.showAllChatroomData(req, res)
  })

  /**
   * @openapi
   * '/api/v1/chatrooms/users/{user_id}':
   *  get:
   *    tags:
   *      - Chatroom
   *    summary: Get data of a chatroom by user id
   *    parameters:
   *      - name: user_id
   *        in: path
   *        description: user id
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */
  app.get('/api/v1/chatrooms/users/:user_id', (req, res) => {
    chatroomController.showChatroomDataByUserId(req, res)
  })

  /**
   * @openapi
   * '/api/v1/chatrooms/users/{user_id}':
   *  delete:
   *    tags:
   *      - Chatroom
   *    summary: Delete all chatroom data of a user
   *    parameters:
   *      - name: user_id
   *        in: path
   *        description: user id
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */
  app.delete('/api/v1/chatrooms/users/:user_id', (req, res) => {
    chatroomController.deleteAllChatroom(req, res)
  })

  /* Message Routes */
  /**
   * @openapi
   * '/api/v1/messages/{chatroom_id}':
   *  post:
   *    tags:
   *      - Message
   *    summary: Make a new message
   *    parameters:
   *      - name: chatroom_id
   *        in: path
   *        description: chatroom id
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/CreateMessageRequest'
   *    responses:
   *      200:
   *        description: Success
   */
  app.post('/api/v1/messages/:chatroom_id', (req, res) => {
    messageController.addMessage(req, res)
  })

  /**
   * @openapi
   * '/api/v1/messages/{chatroom_id}/{message_id}':
   *  delete:
   *    tags:
   *      - Message
   *    summary: Delete a message inside a chatroom
   *    parameters:
   *      - name: chatroom_id
   *        in: path
   *        description: chatroom id
   *        required: true
   *      - name: message_id
   *        in: path
   *        description: message id
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */
  app.delete('/api/v1/messages/:chatroom_id/:message_id', (req, res) => {
    messageController.deleteMessage(req, res)
  })
  
  /**
   * @openapi
   * '/api/v1/messages/{chatroom_id}/{message_id}':
   *  put:
   *    tags:
   *      - Message
   *    summary: Update a message
   *    parameters:
   *      - name: chatroom_id
   *        in: path
   *        description: chatroom id
   *        required: true
   *      - name: message_id
   *        in: path
   *        description: message id
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/CreateMessageRequest'
   *    responses:
   *      200:
   *        description: Success
   */
  app.put('/api/v1/messages/:chatroom_id/:message_id', (req, res) => {
    messageController.updateMessage(req, res)
  })

  /**
   * @openapi
   * '/api/v1/messages/{chatroom_id}/{message_id}':
   *  get:
   *    tags:
   *      - Message
   *    summary: Get a message inside a chatroom
   *    parameters:
   *      - name: chatroom_id
   *        in: path
   *        description: chatroom id
   *        required: true
   *      - name: message_id
   *        in: path
   *        description: message id
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */
  app.get('/api/v1/messages/show/:chatroom_id/:message_id', (req, res) => {
    messageController.showMessageData(req, res)
  })

  /* User Route */
  /**
   * @openapi
   * '/api/v1/users':
   *  post:
   *    tags:
   *      - User
   *    summary: Make a new user
   *    parameters:
   *      - name: user_id
   *        in: path
   *        description: user id
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/UserRequest'
   *    responses:
   *      200:
   *        description: Success
   */
  app.post('/api/v1/users', (req, res) => {
    userController.createUser(req, res)
  })

  /**
   * @openapi
   * '/api/v1/users/{user_id}':
   *  delete:
   *    tags: 
   *      - User
   *    summary: Delete data of a user
   *    parameters:
   *      - name: user_id
   *        in: path
   *        description: user id
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */ 
  app.delete('/api/v1/users/:user_id', (req, res) => {
    userController.deleteUser(req, res)
  })

  /**
   * @openapi
   * '/api/v1/users/{user_id}':
   *  get:
   *    tags: 
   *      - User
   *    summary: Get data of a user
   *    parameters:
   *      - name: user_id
   *        in: path
   *        description: user id
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */ 
  app.get('/api/v1/users/:user_id', (req, res) => {
    userController.showUserData(req, res)
  })

  /**
   * @openapi
   * '/api/v1/users/{user_id}':
   *  put:
   *    tags: 
   *      - User
   *    summary: Update data of a user
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/UserRequest'
   *    parameters:
   *      - name: user_id
   *        in: path
   *        description: user id
   *        required: true
   *    responses:
   *      200:
   *        description: Success
   */ 
  app.put('/api/v1/users/:user_id', (req, res) => {
    userController.updateUser(req, res)
  })

  /**
   * @openapi
   * '/api/v1/users/':
   *  get:
   *    tags:
   *      - User
   *    summary: Get all data of users
   *    responses:
   *      200:
   *        description: Success
   */
  app.get('/api/v1/users', (req, res) => {
    userController.showAllUserData(req, res)
  })

  /* Personalisation Route */
  /**
   * @openapi
   * '/api/v1/personalisation/{user_id}':
   *  post:
   *    tags:
   *      - Personalisation
   *    summary: Make a new personalisation for a user
   *    parameters:
   *      - name: user_id
   *        in: path
   *        description: user id
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/PersonalisationRequest'
   *    responses:
   *      200:
   *        description: Success
   */
  app.post('/api/v1/personalisation/:user_id', (req, res) => {
    userPersonalisationController.createUserPersonalisation(req, res)
  })

  /**
   * @openapi
   * '/api/v1/personalisation/{user_id}':
   *  put:
   *    tags:
   *      - Personalisation
   *    summary: Save personalisation of a user
   *    parameters:
   *      - name: user_id
   *        in: path
   *        description: user id
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/PersonalisationRequest'
   *    responses:
   *      200:
   *        description: Success
   */
  app.put('/api/v1/personalisation/:user_id', (req, res) => {
    userPersonalisationController.saveUserPersonalisation(req, res)
  })

  /**
   * @openapi
   * '/api/v1/personalisation/{user_id}':
   *  delete:
   *    tags:
   *      - Personalisation
   *    summary: Delete a personalisation of a user
   *    parameters:
   *      - name: user_id
   *        in: path
   *        description: user
   *    responses:
   *      200:
   *        description: Success
   */
  app.delete('/api/v1/personalisation/:user_id', (req, res) => {
    userPersonalisationController.deleteUserPersonalisation(req, res)
  })

  /**
   * @openapi
   * '/api/v1/personalisation/{user_id}':
   *  get:
   *    tags:
   *      - Personalisation
   *    summary: Get personalisation of a user
   *    parameters:
   *      - name: user_id
   *        in: path
   *        description: user
   *    responses:
   *      200:
   *        description: Success
   */
  app.get('/api/v1/personalisation/:user_id', (req, res) => {
    userPersonalisationController.getUserPersonalisation(req, res)
  })

  /* Builder Route */
/**
 * @openapi
 * '/api/v1/builds':
 *  post:
 *    tags:
 *      - Build
 *    summary: Create a new build
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/CreateBuildRequest'
 *    responses:
 *      200:
 *        description: Success
 */
app.post('/api/v1/builds', (req, res) => {
  buildController.createBuild(req, res);
});

/**
 * @openapi
 * '/api/v1/builds/{build_id}':
 *  delete:
 *    tags: 
 *      - Build
 *    summary: Delete a build
 *    parameters:
 *      - name: build_id
 *        in: path
 *        description: Build ID
 *        required: true
 *    responses:
 *      200:
 *        description: Success
 */ 
app.delete('/api/v1/builds/:build_id', (req, res) => {
  buildController.deleteBuild(req, res);
});

/**
 * @openapi
 * '/api/v1/builds/{build_id}':
 *  get:
 *    tags: 
 *      - Build
 *    summary: Get data of a build
 *    parameters:
 *      - name: build_id
 *        in: path
 *        description: Build ID
 *        required: true
 *    responses:
 *      200:
 *        description: Success
 */ 
app.get('/api/v1/builds/:build_id', (req, res) => {
  buildController.showBuildData(req, res);
});

/**
 * @openapi
 * '/api/v1/builds/{build_id}':
 *  put:
 *    tags: 
 *      - Build
 *    summary: Update data of a build
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/UpdateBuildRequest'
 *    parameters:
 *      - name: build_id
 *        in: path
 *        description: Build ID
 *        required: true
 *    responses:
 *      200:
 *        description: Success
 */ 
app.put('/api/v1/builds/:build_id', (req, res) => {
  buildController.updateBuild(req, res);
});

/**
 * @openapi
 * '/api/v1/builds':
 *  get:
 *    tags:
 *      - Build
 *    summary: Get all builds
 *    responses:
 *      200:
 *        description: Success
 */
app.get('/api/v1/builds', (req, res) => {
  buildController.showAllBuildData(req, res);
});


  /* Nonexisting Route handling */
  app.all('*', (req, res) => {
    res.status(404).json({ error: 'Cannot access route' });
  });
}

export default routes