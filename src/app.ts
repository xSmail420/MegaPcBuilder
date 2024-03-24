
import firebaseSetup from './utils/firebase.connect';
import routes from './routes';
import swaggerDocs from './utils/swagger.documentation';
import { OpenAI } from 'langchain/llms/openai';
import express from 'express';
import config from 'config';

const app = express();
const port = config.get<number>('port');
export const model = new OpenAI({
  openAIApiKey: config.get("OPEN_AI_API_KEY"),
  modelName: "gpt-3.5-turbo"
});

const startServer = async () => {
  try {
    const db = await firebaseSetup();
    app.use(express.json());

    swaggerDocs(app, port);
    routes(app, db);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    process.exit(1);
  }
};

startServer();
