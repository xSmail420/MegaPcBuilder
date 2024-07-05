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
- [License](#license)

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

bash
Copy code
npm install
Configuration
Create a .env file in the root directory and add your Firebase configuration and other environment variables:

plaintext
Copy code
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
OPENAI_API_KEY=your-openai-api-key
Initialize Firebase Admin SDK in your project.

Scripts
start: Runs the application in production mode.
dev: Runs the application in development mode with hot reloading.
build: Compiles TypeScript files to JavaScript.
To run a script, use:

bash
Copy code
npm run <script-name>
API Documentation
API documentation is generated using OpenAPI (Swagger). To view the API documentation, start the server and navigate to /api-docs.

Project Structure
plaintext
Copy code
|-- src
|   |-- controllers
|   |   |-- build.controller.ts
|   |   |-- user.controller.ts
|   |-- models
|   |   |-- build.model.ts
|   |   |-- user.model.ts
|   |-- routes
|   |   |-- build.route.ts
|   |   |-- user.route.ts
|   |-- utils
|   |   |-- response.utils.ts
|   |-- app.ts
|   |-- index.ts
|-- .env
|-- .gitignore
|-- package.json
|-- tsconfig.json
|-- README.md
Endpoints
User Endpoints
Create User

plaintext
Copy code
POST /api/v1/users
Delete User

plaintext
Copy code
DELETE /api/v1/users/{user_id}
Get User Data

plaintext
Copy code
GET /api/v1/users/{user_id}
Update User Data

plaintext
Copy code
PUT /api/v1/users/{user_id}
Get All Users

plaintext
Copy code
GET /api/v1/users
Build Endpoints
Create Build

plaintext
Copy code
POST /api/v1/builds
Delete Build

plaintext
Copy code
DELETE /api/v1/builds/{build_id}
Get Build Data

plaintext
Copy code
GET /api/v1/builds/{build_id}
Update Build Data

plaintext
Copy code
PUT /api/v1/builds/{build_id}
Get All Builds

plaintext
Copy code
GET /api/v1/builds
Generate Build Using AI

plaintext
Copy code
POST /api/v1/aibuilder
Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes.
Commit your changes (git commit -m 'Add some feature').
Push to the branch (git push origin feature-branch).
Open a Pull Request.
