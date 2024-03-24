"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangChainUtils = void 0;
const memory_1 = require("langchain/memory");
const memory_2 = require("langchain/memory");
const chains_1 = require("langchain/chains");
const prompts_1 = require("langchain/prompts");
const app_1 = require("../app");
const config_1 = __importDefault(require("config"));
class LangChainUtils {
    /**
     * Creates a new chat message history
     * @param messages
     * @returns ChatMessageHistory
     */
    static createChatMessageHistory(messages) {
        const history = new memory_1.ChatMessageHistory();
        messages.forEach((message) => {
            switch (message.sender) {
                case "AstroBot":
                    {
                        history.addAIChatMessage(message.content);
                        break;
                    }
                default:
                    {
                        history.addUserMessage(message.content);
                    }
            }
        });
        return history;
    }
    /**
     * Summarizes Messages
     * @param messages
     * @returns A summarize
     */
    static async summarizeMessages(messages) {
        const summary_memory = new memory_1.ConversationSummaryMemory({
            llm: app_1.model,
            chatHistory: LangChainUtils.createChatMessageHistory(messages)
        });
        const summary = await summary_memory.predictNewSummary(await summary_memory.chatHistory.getMessages(), "");
        return summary;
    }
    static async getResponse(db, content, user_id, doc_id) {
        var _a, _b;
        try {
            const userSnapshot = await db.collection('users').doc(user_id).get();
            const personalisationSnapshot = await db.collection('userPersonalisation').doc((_a = userSnapshot.data()) === null || _a === void 0 ? void 0 : _a.personalisation_id).get();
            const personalisationData = personalisationSnapshot.data();
            const userData = userSnapshot.data();
            const userName = `Name: ${userData.name}`;
            const userAge = `Age: ${userData.age}`;
            const userGender = `Gender: ${userData.gender}`;
            const userOccupation = `Race: ${userData.occupation}`;
            const userLocation = `Location: ${userData.location}`;
            const userDetailString = `${userName}\n${userAge}\n${userGender}\n${userOccupation}\n${userLocation}\n`;
            const userPersonalisationString = LangChainUtils.formatUserPersonalisation(personalisationData);
            const template = `
                ${config_1.default.get("PROMPT_HEADER")}
                Personal Details: ${userDetailString}
                System: {chat_summary}
                Personalisation: ${userPersonalisationString}
                {recent_chat_history}
                Current conversation:
                Human: {human_input}
                AI:`;
            const prompt = new prompts_1.PromptTemplate({
                inputVariables: ["chat_summary", "recent_chat_history", "human_input"],
                template: template,
            });
            const snapshot = await db.collection('chatrooms').doc(doc_id).get();
            const messages = (_b = snapshot.data()) === null || _b === void 0 ? void 0 : _b.messages;
            const history = LangChainUtils.createChatMessageHistory(messages);
            const memory = new memory_2.BufferMemory({
                chatHistory: history,
                memoryKey: "recent_chat_history",
                inputKey: "human_input",
                returnMessages: false,
            });
            const chain = new chains_1.ConversationChain({
                memory: memory,
                verbose: false,
                llm: app_1.model,
                prompt: prompt,
            });
            const response = await chain.predict({
                chat_summary: await LangChainUtils.summarizeMessages(messages),
                human_input: content,
            });
            return response;
        }
        catch (error) {
            return error.message;
        }
    }
    static formatUserPersonalisation(userPersonalisation) {
        const formattedAnswers = userPersonalisation.answers.map(({ question, answer }) => {
            return `Question: ${question} Answer: ${answer}`;
        });
        return formattedAnswers.join('\n');
    }
}
exports.LangChainUtils = LangChainUtils;
