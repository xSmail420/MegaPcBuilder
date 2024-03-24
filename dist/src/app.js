"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.model = void 0;
const firebase_connect_1 = __importDefault(require("./utils/firebase.connect"));
const routes_1 = __importDefault(require("./routes"));
const swagger_documentation_1 = __importDefault(require("./utils/swagger.documentation"));
const openai_1 = require("langchain/llms/openai");
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("config"));
const app = (0, express_1.default)();
const port = config_1.default.get('port');
exports.model = new openai_1.OpenAI({
    openAIApiKey: config_1.default.get("OPEN_AI_API_KEY"),
    modelName: "gpt-3.5-turbo"
});
const startServer = async () => {
    try {
        const db = await (0, firebase_connect_1.default)();
        app.use(express_1.default.json());
        (0, swagger_documentation_1.default)(app, port);
        (0, routes_1.default)(app, db);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error('Failed to initialize Firebase:', error);
        process.exit(1);
    }
};
startServer();
