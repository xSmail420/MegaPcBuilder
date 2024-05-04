import { json } from "body-parser";
import { model } from "../app"; // Import the OpenAI model from app.ts
import { BuildDataModel, BuildExampleModel } from "../models/build.model";
import { fetchComponentData } from "./components.utils";
import { Firestore } from "@google-cloud/firestore";
import { ComponentModel } from "../models/component.module";

const PriceFactor = 1;
export async function generateComputerBuild(
  userInput: { budget: number; purpose: string },
  db: Firestore
): Promise<Partial<BuildExampleModel> | null> {
  let build: Partial<BuildExampleModel> | null = {}; // Initialize an empty build object

  // Step 1: Select CPU and motherboard
  build = await selectCPUAndMotherboard(build, userInput, db);

  // Step 2: Select GPU
  if (build) build = await selectGPU(db, build, userInput);

  // Step 3: Select RAM, storage, PSU, case, and cooling
  if (build) build = await selectComponents(db, build, userInput);

  return build;
}

async function selectCPUAndMotherboard(
  build: Partial<BuildExampleModel>,
  userInput: { budget: number; purpose: string },
  db: Firestore
): Promise<Partial<BuildExampleModel> | null> {
  let selectedCPU: Partial<any> | null = null;
  let selectedMotherboard: Partial<any> | null = null;
  let cpuComponents: any[];
  let motherboardComponents: any[];

  // Fetch CPU and motherboard components from the database
  const cpuData: { data: any[]; priceRange: { min: number; max: number } } =
    await fetchComponentData("PROCESSEUR", db, userInput.budget);
  const motherboardData: {
    data: any[];
    priceRange: { min: number; max: number };
  } = await fetchComponentData("CARTE MÈRE", db, userInput.budget);
  // Fetch CPU and motherboard components from the database
  cpuComponents = cpuData.data.filter((component) => {
    // Filter components that are not SSD or NVMe
    if (
      component.nFilsCategs[0] &&
      ["DISQUE-SSD", "DISQUE-NVME", "DISQUE-SSD", "STORAGE"].includes(
        component.nFilsCategs[0]
      )
    ) {
      return true;
    }
    const price = component.price;
    return price >= 10 && price <= cpuData.priceRange.max * PriceFactor;
  });

  motherboardComponents = motherboardData.data.filter((component) => {
    // Filter components that are not SSD or NVMe
    if (
      component.nFilsCategs[0] &&
      ["DISQUE-SSD", "DISQUE-NVME", "DISQUE-SSD", "STORAGE"].includes(
        component.nFilsCategs[0]
      )
    ) {
      return true;
    }
    const price = component.price;
    return price >= 10 && price <= cpuData.priceRange.max * PriceFactor;
  });

  let cpuComponentsCopy: ComponentModel[] = mapComponents(cpuComponents);

  let motherboardComponentsCopy: ComponentModel[] = mapComponents(
    motherboardComponents
  );

  // Check if CPU and motherboard components are available
  if (cpuComponentsCopy && motherboardComponentsCopy) {
    const prompt = `
                    You are the AI assistant, a cutting-edge virtual companion specialized in creating custom computer builds based on user input.
                    START USERINPUT BLOCK
                    ${JSON.stringify(userInput)}
                    END OF USERINPUT BLOCK
                    The AI assistant is highly proficient in understanding user requirements and constraints, adept at balancing performance, budget, and preferences to generate the most suitable computer builds.
                    Your job is to choose the best compatible components that are available in the context and meet user budget, purpose, and preferences.
                    The user budget is the budget for a full build with all components.
                    The price of selected Processors should be in the range ${JSON.stringify(
                      cpuData.priceRange
                    )} and Motherboards in range ${JSON.stringify(
      motherboardData.priceRange
    )}. 
                    you should return the attribute 'lien' exactly as it is in the context (respect uppercase, lowercase, spaces, dashes and punctuation).
                    Your response should be exatcly in this format (no more no less):
                    \n\n
                    { 'PROCESSEUR' : { 'lien': string, 'index': number }, 'CARTE MÈRE': { 'lien': string, 'index': number } }
                    \n\n
                    where index is the index of the selected component in the context.
                    START CONTEXT BLOCK
                    ${JSON.stringify({
                      cpus: cpuComponentsCopy,
                      motherboards: motherboardComponentsCopy,
                    })}
                    END OF CONTEXT BLOCK
                    Use this budget percentages guide to determine the best compatible components.
                `;

    try {
      // Invoke model to check compatibility
      const response = await model.invoke(prompt);

      const resultComponents = response.trim().replace(/'/g, '"');

      const result = JSON.parse(resultComponents);

      const cpuIndex = result["PROCESSEUR"].index;
      const motherboardIndex = result["CARTE MÈRE"].index;

      selectedCPU = cpuComponents[cpuIndex];
      selectedMotherboard = motherboardComponents[motherboardIndex];
    } catch (error) {
      console.error("Error checking compatibility:", error);
    }
  }

  // Update selected components with chosen CPU and motherboard
  build["PROCESSEUR" as keyof BuildExampleModel] = selectedCPU;
  build["CARTE MÈRE" as keyof BuildExampleModel] = selectedMotherboard;

  return build;
}

async function selectGPU(
  db: Firestore,
  selectedComponents: Partial<BuildExampleModel>,
  userInput: { budget: number; purpose: string }
): Promise<Partial<BuildExampleModel> | null> {
  let selectedGPU: Partial<any> | null = null;
  let gpuComponents: any[];

  // Fetch GPU components from the database
  const gpuData: { data: any[]; priceRange: { min: number; max: number } } =
    await fetchComponentData("CARTE GRAPHIQUE", db, userInput.budget);
  gpuComponents = gpuData.data.filter((component) => {
    // Filter components that are not SSD or NVMe
    if (
      component.nFilsCategs[0] &&
      ["DISQUE-SSD", "DISQUE-NVME", "DISQUE-SSD", "STORAGE"].includes(
        component.nFilsCategs[0]
      )
    ) {
      return true;
    }
    const price = component.price;
    return price >= 10 && price <= gpuData.priceRange.max * PriceFactor;
  });

  let gpuComponentsCopy: ComponentModel[] = mapComponents(gpuComponents);

  // Check if GPU components are available
  if (gpuComponentsCopy) {
    const prompt = `
                    You are the AI assistant, a cutting-edge virtual companion specialized in creating custom computer builds based on user input.
                    START USERINPUT BLOCK
                    ${JSON.stringify(userInput)}
                    END OF USERINPUT BLOCK
                    The AI assistant is highly proficient in understanding user requirements and constraints, adept at balancing performance, budget, and preferences to generate the most suitable computer builds.
                    The price of selected GPU should be in the range ${JSON.stringify(
                      gpuData.priceRange
                    )} 
                    Your job is to choose the best compatible GPU available in the context that meets user budget, purpose, preferences and compatibile with selected components.
                    START SELECTED COMPONENTS BLOCK
                    ${JSON.stringify(
                      convertBuildExampleToBuildData(selectedComponents)
                    )}
                    END OF SELECTED COMPONENTS BLOCK
                    The user budget is the budget for a full build with all components.
                    Your response should be exatcly in this format (no more no less):
                    \n\n
                    { 'CARTE GRAPHIQUE' : { 'lien': string, 'index': number } }
                    \n\n
                    where index is the index of the selected component in the context.
                    START CONTEXT BLOCK
                    ${JSON.stringify({ gpu: gpuComponentsCopy })}
                    END OF CONTEXT BLOCK
                    Use this budget percentages guide to determine the best compatible components.
                `;

    try {
      // Invoke model to check compatibility
      const response = await model.invoke(prompt);
      const resultComponents = response.trim().replace(/'/g, '"');
      let result;
      try {
        result = JSON.parse(resultComponents);
      } catch (error) {
        console.log("Error parsing JSON:", error);
        console.log("model response: ", resultComponents);
        result = JSON.parse(
          `{ "CARTE GRAPHIQUE": { index: 0 } }`.trim().replace(/'/g, '"')
        );
      }

      const gpuIndex = result["CARTE GRAPHIQUE"].index;

      selectedGPU = gpuComponents[gpuIndex];
    } catch (error) {
      console.error("Error selecting GPU:", error);
    }
  }

  // Update selected components with chosen GPU
  selectedComponents["CARTE GRAPHIQUE" as keyof BuildExampleModel] =
    selectedGPU;

  return selectedComponents;
}

async function selectComponent(
  componentType: string,
  components: Partial<any>[],
  selectedComponents: Partial<BuildExampleModel>,
  userInput: { budget: number; purpose: string },
  priceRange: { min: number; max: number }
): Promise<Partial<any> | null> {
  let selectedComponent: Partial<any> | null = null;

  // Check if components are available
  if (components) {
    const componentsCopy: ComponentModel[] = mapComponents(components);

    const prompt = `
                    You are the AI assistant, a cutting-edge virtual companion specialized in creating custom computer builds based on user input.
                    START USERINPUT BLOCK
                    ${JSON.stringify(userInput)}
                    END OF USERINPUT BLOCK
                    The price of selected ${componentType} should be in the range ${JSON.stringify(
      priceRange
    )} 
                    The AI assistant is highly proficient in understanding user requirements and constraints, adept at balancing performance, budget, and preferences to generate the most suitable computer builds.
                    Your job is to choose the best compatible ${componentType} available in the context that meets user budget, purpose, preferences and compatibile with selected components.
                    START SELECTED COMPONENTS BLOCK
                    ${JSON.stringify(
                      convertBuildExampleToBuildData(selectedComponents)
                    )}
                    END OF SELECTED COMPONENTS BLOCK
                    The user budget is the budget for a full build with all components (not just this component).
                    When selecting the storage component always prefer the  'MSI SPATIUM 500GB' if user did not include any storage preferences.
                    you should return the attribute 'lien' exactly as it is in the context (respect uppercase, lowercase, spaces, dashes and punctuation).
                    Your response should be  exatcly in this format (no more no less):
                    \n\n
                    { '${componentType}' : { 'lien': string, 'index': number } }
                    \n\n
                    where index is the index of the selected component in the context.
                    START CONTEXT BLOCK
                    ${JSON.stringify({
                      [componentType.toLowerCase()]: componentsCopy,
                    })}
                    END OF CONTEXT BLOCK
                    `;

    try {
      // Invoke model to check compatibility
      const response = await model.invoke(prompt);
      const resultComponents = response.trim().replace(/'/g, '"');
      const selectedComponentData: { [key: string]: Partial<any> } =
        JSON.parse(resultComponents);
      const componentIndex = selectedComponentData[componentType].index;

      // Retrieve the selected component from the original array using the index
      selectedComponent = components[componentIndex];
    } catch (error) {
      console.error(`Error selecting ${componentType}:`, error);
    }
  }

  return selectedComponent;
}

async function selectComponents(
  db: Firestore,
  selectedComponents: Partial<BuildExampleModel>,
  userInput: { budget: number; purpose: string }
): Promise<Partial<BuildExampleModel> | null> {
  let selectedRAM: Partial<ComponentModel> | null = null;
  let selectedStorage: Partial<ComponentModel> | null = null;
  let selectedPSU: Partial<ComponentModel> | null = null;
  let selectedCase: Partial<ComponentModel> | null = null;
  let selectedCooling: Partial<ComponentModel> | null = null;
  let ramComponents: ComponentModel[];
  let storageComponents: ComponentModel[];
  let psuComponents: ComponentModel[];
  let caseComponents: ComponentModel[];
  let coolingComponents: ComponentModel[];

  // Fetch RAM, storage, PSU, case, and cooling components from the database
  const ramData: { data: any[]; priceRange: { min: number; max: number } } =
    await fetchComponentData("BARETTE MÉMOIRE", db, userInput.budget);
  const storageData: { data: any[]; priceRange: { min: number; max: number } } =
    await fetchComponentData("STORAGE", db, userInput.budget);
  const psuData: { data: any[]; priceRange: { min: number; max: number } } =
    await fetchComponentData("ALIMENTATION", db, userInput.budget);
  const caseData: { data: any[]; priceRange: { min: number; max: number } } =
    await fetchComponentData("BOITIER", db, userInput.budget);
  const coolingData: { data: any[]; priceRange: { min: number; max: number } } =
    await fetchComponentData("REFROIDISSEMENT", db, userInput.budget);
  ramComponents = ramData.data.filter((component) => {
    // Filter components that are not SSD or NVMe
    if (
      component.nFilsCategs[0] &&
      ["DISQUE-SSD", "DISQUE-NVME", "DISQUE-SSD", "STORAGE"].includes(
        component.nFilsCategs[0]
      )
    ) {
      return true;
    }
    const price = component.price;
    return price >= 10 && price <= ramData.priceRange.max * PriceFactor;
  });
  storageComponents = storageData.data.filter((component) => {
    // Filter components that are not SSD or NVMe
    if (
      component.nFilsCategs[0] &&
      ["DISQUE-SSD", "DISQUE-NVME", "DISQUE-SSD", "STORAGE"].includes(
        component.nFilsCategs[0]
      )
    ) {
      return true;
    }
    const price = component.price;
    return price >= 10 && price <= storageData.priceRange.max * PriceFactor;
  });
  psuComponents = psuData.data.filter((component) => {
    // Filter components that are not SSD or NVMe
    if (
      component.nFilsCategs[0] &&
      ["DISQUE-SSD", "DISQUE-NVME", "DISQUE-SSD", "STORAGE"].includes(
        component.nFilsCategs[0]
      )
    ) {
      return true;
    }
    const price = component.price;
    return price >= 10 && price <= psuData.priceRange.max * PriceFactor;
  });
  caseComponents = caseData.data.filter((component) => {
    // Filter components that are not SSD or NVMe
    if (
      component.nFilsCategs[0] &&
      ["DISQUE-SSD", "DISQUE-NVME", "DISQUE-SSD", "STORAGE"].includes(
        component.nFilsCategs[0]
      )
    ) {
      return true;
    }
    const price = component.price;
    return price >= 10 && price <= caseData.priceRange.max * PriceFactor;
  });
  coolingComponents = coolingData.data.filter((component) => {
    // Filter components that are not SSD or NVMe
    if (
      component.nFilsCategs[0] &&
      ["DISQUE-SSD", "DISQUE-NVME", "DISQUE-SSD", "STORAGE"].includes(
        component.nFilsCategs[0]
      )
    ) {
      return true;
    }
    const price = component.price;
    return price >= 10 && price <= coolingData.priceRange.max * PriceFactor;
  });

  // Check if components are available
  if (
    ramComponents &&
    storageComponents &&
    psuComponents &&
    caseComponents &&
    coolingComponents
  ) {
    // Prompt model to select compatible RAM module
    selectedRAM = await selectComponent(
      "BARETTE MÉMOIRE",
      ramComponents,
      selectedComponents,
      userInput,
      ramData.priceRange
    );

    // Prompt model to select compatible storage device
    selectedStorage = await selectComponent(
      "STORAGE",
      storageComponents,
      selectedComponents,
      userInput,
      storageData.priceRange
    );

    // Prompt model to select compatible PSU
    selectedPSU = await selectComponent(
      "ALIMENTATION",
      psuComponents,
      selectedComponents,
      userInput,
      psuData.priceRange
    );

    // Prompt model to select compatible case
    selectedCase = await selectComponent(
      "BOITIER",
      caseComponents,
      selectedComponents,
      userInput,
      caseData.priceRange
    );

    // Prompt model to select compatible cooling solution
    selectedCooling = await selectComponent(
      "REFROIDISSEMENT",
      coolingComponents,
      selectedComponents,
      userInput,
      coolingData.priceRange
    );
  }

  // Update selected components with chosen RAM, storage, PSU, case, and cooling
  selectedComponents["BARETTE MÉMOIRE" as keyof BuildExampleModel] =
    selectedRAM;
  selectedComponents["STORAGE" as keyof BuildExampleModel] = selectedStorage;
  selectedComponents["ALIMENTATION" as keyof BuildExampleModel] = selectedPSU;
  selectedComponents["BOITIER" as keyof BuildExampleModel] = selectedCase;
  selectedComponents["REFROIDISSEMENT" as keyof BuildExampleModel] =
    selectedCooling;

  return selectedComponents;
}

function convertBuildExampleToBuildData(
  selectedComponents: BuildExampleModel
): BuildDataModel {
  const buildData: BuildDataModel = {};

  // Iterate over each property in selectedComponents
  for (const key in selectedComponents) {
    if (selectedComponents.hasOwnProperty(key)) {
      // Convert the value to Partial<ComponentModel>
      const value: any = selectedComponents[key as keyof BuildExampleModel]; // Type assertion
      const partialComponent: Partial<ComponentModel> = value;

      // Assign the converted value to the corresponding property in buildData
      buildData[key as keyof BuildExampleModel] = partialComponent; // Type assertion
    }
  }

  return buildData;
}

function mapComponents(data: any[]): ComponentModel[] {
  const components: ComponentModel[] = data.map((item: any) => ({
    price: item.price,
    lien: item.lien,
  }));
  return components;
}
