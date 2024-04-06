import { model } from "../app"; // Import the OpenAI model from app.ts
import { ComponentModel } from "../models/component.module"; // Import the ComponentModel interface

export async function generateComputerBuild(
  filteredComponents: { [key: string]: ComponentModel[] },
  userInput: { budget: number; purpose: string }
): Promise<string> {
  const context = {
    filteredComponents,
  };

  const prompt = `
        The AI assistant is a cutting-edge virtual companion specialized in creating custom computer builds based on user input. 
        It possesses an extensive database of components and configurations, ensuring optimal performance for various purposes such as gaming, productivity, or content creation.
        The AI assistant is highly proficient in understanding user requirements and constraints, adept at balancing performance, budget, and preferences to generate the most suitable computer builds.
        Your response should be in this format:
\n\n
{ 'PROCESSEUR' : { 'lien': string }, 'CARTE MÈRE': { 'lien': string }, 'BARETTE MÉMOIRE': { 'lien': string }, 'ALIMENTATION': { 'lien': string }, 'STORAGE': { 'lien': string },'BOITIER': { 'lien': string }, 'CARTE GRAPHIQUE': { 'lien': string } }
\n\n
        START CONTEXT BLOCK
        ${JSON.stringify(context)}
        END OF CONTEXT BLOCK
        EVERY "lien: " attribute in the response is provided in the CONTEXT BLOCK under it's own category.
        AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
        AI assistant will always follows the response format provided.
        AI assistant will not mismatch a components type with another from the context.
        AI assistant will not invent anything that is not drawn directly from the context.
        AI assistant will always use the USERINPUT BLOCK to satisfy the user's needs.
        AI assistant will always respect the USER budget and tries to be as close to the budget as possible.
        The users "prefs" are his preferences for the build along with the rest of the components.

        START USERINPUT BLOCK
        ${JSON.stringify(userInput)}
        END OF USERINPUT BLOCK
    `;

  try {
    const generatedBuild = await model.invoke(prompt);
    return generatedBuild;
  } catch (error) {
    console.error("Error generating computer build:", error);
    return ""; // Return an empty string in case of an error
  }
}
