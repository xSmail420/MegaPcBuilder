import axios from "axios";
import { ComponentModel } from "../models/component.module"; // Import the ComponentModel interface
import config from "config";
import { Firestore } from "@google-cloud/firestore";

interface BudgetPercentages {
  [key: string]: {
    min: number;
    max: number;
  };
}

// Define a function to fetch component data for a specific component type from the API
async function fetchComponentData(
  componentType: string,
  db: Firestore
): Promise<ComponentModel[]> {
  try {
    const response = await axios.post(
      `${config.get("MEGAPC_CLIENT_API")}/produit/byPaginationNew`,
      {
        filscateg: { titre: componentType },
      }
    );

    response.data.map(async (item: any) => {
      //save in firestore
      const buildRef = db.collection("Components").doc(item.lien);
      await buildRef.set(item);
    });

    // Extract relevant information from the response and map it to ComponentModel interface
    const components: ComponentModel[] = response.data.map((item: any) => ({
      title_fr: item.title_fr,
      price: item.price,
      stock: item.stock,
      lien: item.lien,
      nFilsCategs: item.nFilsCategs[0],
    }));

    return components;
  } catch (error) {
    console.error("Error fetching component data:", error);
    return []; // Return an empty array if there's an error
  }
}

export async function getComponentData(
  lien: string,
  db: Firestore
): Promise<any> {
  try {
    const componentRef = db.collection("Components").doc(lien);
    const componentDoc = await componentRef.get();
    console.log("componentDoc", componentDoc.data());
    

    // Extract relevant information from the response and map it to ComponentModel interface
    const component = componentDoc.data();

    return component;
  } catch (error) {
    console.error("Error fetching component data:", error);
    return []; // Return an empty array if there's an error
  }
}

export const componentTypes = [
  "PROCESSEUR",
  "REFROIDISSEMENT",
  "CARTE MÈRE",
  "BARETTE MÉMOIRE",
  "ALIMENTATION",
  "DISQUE-SSD",
  "DISQUE-HDD",
  "DISQUE-NVME",
  "VENTILATEUR",
  "CARTE GRAPHIQUE",
];
// Define a function to filter components by price range
export async function filterComponentsByBudget(
  userBudget: number,
  db: Firestore
): Promise<{ [key: string]: ComponentModel[] }> {
  const filteredComponents: { [key: string]: ComponentModel[] } = {};

  // Define budget allocation percentages for each component type
  const budgetPercentages: BudgetPercentages = {
    PROCESSEUR: { min: 0.15, max: 0.3 }, // Processor/CPU
    REFROIDISSEMENT: { min: 0.05, max: 0.12 }, // Cooling solution
    "CARTE MÈRE": { min: 0.08, max: 0.15 }, // Motherboard
    "BARETTE MÉMOIRE": { min: 0.05, max: 0.15 }, // Memory/RAM
    ALIMENTATION: { min: 0.03, max: 0.15 }, // Power Supply Unit (PSU)
    "DISQUE-SSD": { min: 0.01, max: 0.25 }, // Solid State Drive (SSD)
    "DISQUE-HDD": { min: 0.03, max: 0.1 }, // Hard Disk Drive (HDD)
    "DISQUE-NVME": { min: 0.03, max: 0.1 }, // NVMe SSD
    VENTILATEUR: { min: 0.03, max: 0.07 }, // Additional case fans or CPU cooling
    "CARTE GRAPHIQUE": { min: 0.15, max: 0.3 }, // Graphics Card (GPU)
  };

  // Iterate over each component type and fetch component data
  for (const componentType of componentTypes) {
    const components = await fetchComponentData(componentType, db);

    // Calculate the price range for the current component type based on the user's budget
    const priceRange = {
      min:
        userBudget *
        budgetPercentages[componentType as keyof typeof budgetPercentages].min,
      max:
        userBudget *
        budgetPercentages[componentType as keyof typeof budgetPercentages].max,
    };

    // Filter components based on their prices falling within the respective price ranges for the current component type
    const filteredComponentsForType = components.filter((component) => {
      const price = component.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Store the filtered components for the current component type
    filteredComponents[componentType] = filteredComponentsForType.slice(0, 5);
  }

  return filteredComponents;
}
