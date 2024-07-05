# MegaPc AI Builder: Express TypeScript OpenAi API with Firebase Integration

This project is an Express.js API built with TypeScript and integrates with Firebase. The API provides endpoints for user management and build generation using AI.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Endpoints](#endpoints)
- [Contributing](#contributing)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine.
- Firebase project set up with Firestore and credentials.
- OpenAI API key if using AI features.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
Install dependencies:

```bash
npm install
```

## Configuration
1. Edit the config/default.ts file and add your Firebase configuration and other environment variables:

```bash
export default {
  firebaseCredential: {
    type: "",
    project_id: "",
    private_key_id: "",
    private_key: "",
    client_email: "",
    client_id: "",
    auth_uri: "",
    token_uri: "",
    auth_provider_x509_cert_url: "",
    client_x509_cert_url: "",
    universe_domain: "",
  },
  databaseURL: "",
  port: 3000,
  OPEN_AI_API_KEY: "",
  PROMPT_HEADER: "",
  MEGAPC_CLIENT_API: "",
  MEGAPC_BACKEND_API: ""
};
```
2. Initialize Firebase Admin SDK in your project.

## Scripts
`start`: Runs the application in production mode.
`dev`: Runs the application in development mode with hot reloading.
`build`: Compiles TypeScript files to JavaScript.
To run a script, use:

```bash
npm run <script-name>
```
## API Documentation
API documentation is generated using OpenAPI (Swagger). To view the API documentation, start the server and navigate to /api-docs.

## Project Structure

```bash
|-- config
|   |-- default.example.ts
|-- src
|   |-- controllers
|   |   |-- builder.controller.ts
|   |-- models
|   |   |-- build.model.ts
|   |   |-- component.module.ts
|   |-- utils
|   |   |-- aibuilder.utils.ts
|   |   |-- components.utils.ts
|   |   |-- firebase.connect.ts
|   |   |-- response.utils.ts
|   |   |-- swagger.documentation.ts
|   |-- app.ts
|   |-- routes.ts
|-- .gitignore
|-- Dockerfile
|-- README.md
|-- package-lock.json
|-- package.json
|-- tsconfig.json
```
## Endpoints
### User Endpoints

Create User
```bash
POST /api/v1/users
```
Delete User
```bash
DELETE /api/v1/users/{user_id}
```
Get User Data
```bash
GET /api/v1/users/{user_id}
```
Update User Data
```bash
PUT /api/v1/users/{user_id}
```
Get All Users
```bash
GET /api/v1/users
```

### Build Endpoints
Create Build
```bash
POST /api/v1/builds
```

Delete Build
```bash
DELETE /api/v1/builds/{build_id}
```

Get Build Data
```bash
GET /api/v1/builds/{build_id}
```
Update Build Data
```bash
PUT /api/v1/builds/{build_id}
```
Get All Builds
```bash
GET /api/v1/builds
```
Generate Build Using AI
```bash
POST /api/v1/aibuilder
```
## Contributing
Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Make your changes.
4. Commit your changes (git commit -m 'Add some feature').
5. Push to the branch (git push origin feature-branch).
6. Open a Pull Request.
