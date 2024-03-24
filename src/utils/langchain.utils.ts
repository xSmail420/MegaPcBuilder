import { Firestore } from '@google-cloud/firestore'
import { ChatMessageHistory, ConversationSummaryMemory } from "langchain/memory"
import { BufferMemory } from "langchain/memory"
import { ConversationChain } from "langchain/chains"
import { PromptTemplate } from "langchain/prompts"
import { MessageModel } from '../models/message.model'
import { UserPersonalisation } from '../models/personalisation.model'
import { model } from '../app'

import config from "config"
import { UserModel } from '../models/user.model'

export class LangChainUtils {

    /**
     * Creates a new chat message history
     * @param messages 
     * @returns ChatMessageHistory
     */
    public static createChatMessageHistory(messages: MessageModel[]) : ChatMessageHistory{
        const history = new ChatMessageHistory()
        messages.forEach((message) => {
            switch(message.sender){
                case "AstroBot":
                    {
                        history.addAIChatMessage(message.content)
                        break
                    }
                default:
                    {
                        history.addUserMessage(message.content)
                    }
            }
        })
        return history
    }

    /**
     * Summarizes Messages
     * @param messages 
     * @returns A summarize
     */
    public static async summarizeMessages(messages: MessageModel[]) : Promise<String>{
        const summary_memory = new ConversationSummaryMemory({
            llm: model,
            chatHistory: LangChainUtils.createChatMessageHistory(messages)
        })
        const summary = await summary_memory.predictNewSummary(await summary_memory.chatHistory.getMessages(), "")
        return summary
    }

    public static async getResponse(db: Firestore, content: string, user_id: string, doc_id: string): Promise<string> {
        try {
            const userSnapshot = await db.collection('users').doc(user_id).get()
            const personalisationSnapshot = await db.collection('userPersonalisation').doc(userSnapshot.data()?.personalisation_id).get()
            const personalisationData = personalisationSnapshot.data() as UserPersonalisation
            
            const userData = userSnapshot.data() as UserModel
            const userName =  `Name: ${userData.name}`
            const userAge = `Age: ${userData.age}`
            const userGender = `Gender: ${userData.gender}`
            const userOccupation = `Race: ${userData.occupation}`
            const userLocation = `Location: ${userData.location}`

            const userDetailString = `${userName}\n${userAge}\n${userGender}\n${userOccupation}\n${userLocation}\n`
            const userPersonalisationString = LangChainUtils.formatUserPersonalisation(personalisationData)

            const template = `
                ${config.get("PROMPT_HEADER")}
                Personal Details: ${userDetailString}
                System: {chat_summary}
                Personalisation: ${userPersonalisationString}
                {recent_chat_history}
                Current conversation:
                Human: {human_input}
                AI:`
      
            const prompt = new PromptTemplate({
                inputVariables: ["chat_summary", "recent_chat_history", "human_input"],
                template: template,
            })
      
            const snapshot = await db.collection('chatrooms').doc(doc_id).get()
            const messages = snapshot.data()?.messages
      
            const history = LangChainUtils.createChatMessageHistory(messages)
      
            const memory = new BufferMemory({
                chatHistory: history,
                memoryKey: "recent_chat_history",
                inputKey: "human_input",
                returnMessages: false,
            })
      
            const chain = new ConversationChain({
                memory: memory,
                verbose: false,
                llm: model,
                prompt: prompt,
            })
      
            const response = await chain.predict({
                chat_summary: await LangChainUtils.summarizeMessages(messages),
                human_input: content,
            })
      
            return response
        } catch (error: any) {
            return error.message;
        }
    }
    
    static formatUserPersonalisation(userPersonalisation: UserPersonalisation): string {
        const formattedAnswers = userPersonalisation.answers.map(({ question, answer }) => {
          return `Question: ${question} Answer: ${answer}`;
        });
      
        return formattedAnswers.join('\n');
      }      
}