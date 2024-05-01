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
    let data;
    if (
      ["DISQUE-SSD", "DISQUE-NVME", "DISQUE-SSD", "STORAGE"].includes(
        componentType
      )
    ) {
      const StorageRef = [
        "MSI-SPATIUM-M480-PRO-2TO-PCIE-4-0-NVME-M-2",
        "Seagate-BarraCuda-1To-7200RPM",
        "MSI-SPATIUM-M371-1TB",
        "MSI-SPATIUM-M371-500GB",
        "MSI-SPATIUM-S270-480-GB",
        "GIGABYTE-GEN3-2500E-SSD-NVME-500-GB",
      ];

      let i = [];
      for (const disk of StorageRef) {
        const r = await getComponentData(disk, db);
        i.push(r);
      }
      data = i;
    } else {
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

      data = response.data;
    }

    // Extract relevant information from the response and map it to ComponentModel interface
    const components: ComponentModel[] = data.map((item: any) => ({
      title_fr: item.title_fr,
      price: item.price,
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

    // Extract relevant information from the response and map it to ComponentModel interface
    const component = componentDoc.data();

    return component;
  } catch (error) {
    console.error("Error fetching component data:", error);
    return []; // Return an empty array if there's an error
  }
}

export const componentTypes = [
  "PROCESSEUR", // CPU
  "CARTE MÈRE", // Motherboard
  "BARETTE MÉMOIRE", // RAM
  "ALIMENTATION", // POWER SUPPLIES
  "STORAGE", // STOCKAGE
  "REFROIDISSEMENT", // COOLING
  "CARTE GRAPHIQUE", // GPU
  "BOITIER", // Case
];
// Define a function to filter components by price range
export async function filterComponentsByBudget(
  userBudget: number,
  db: Firestore
): Promise<{ [key: string]: ComponentModel[] }> {
  const filteredComponents: { [key: string]: ComponentModel[] } = {};

  const budgetPercentages: BudgetPercentages = {
    PROCESSEUR: { min: 0.1517, max: 0.2909 }, // Processor (CPU)
    "CARTE GRAPHIQUE": { min: 0.1517, max: 0.2909 }, // Graphics Card (GPU)
    "CARTE MÈRE": { min: 0.0816, max: 0.1517 }, // Motherboard
    "BARETTE MÉMOIRE": { min: 0.0816, max: 0.1517 }, // Memory (RAM)
    ALIMENTATION: { min: 0.0445, max: 0.0816 }, // Power Supply Unit (PSU)
    REFROIDISSEMENT: { min: 0.0445, max: 0.1174 }, // Cooling
    BOITIER: { min: 0.0445, max: 0.0816 }, //  case 
    STORAGE: { min: 0.0816, max: 0.1517 }, // storage
    "DISQUE-SSD": { min: 0.0716, max: 0.1417 }, // Solid State Drive (SSD)
    "DISQUE-HDD": { min: 0.0716, max: 0.1417 }, // Hard Disk Drive (HDD)
    "DISQUE-NVME": { min: 0.0716, max: 0.1417 }, // NVMe SSD
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
      // Filter components that are not SSD or NVMe
      if (
        component.nFilsCategs &&
        ["DISQUE-SSD", "DISQUE-NVME", "DISQUE-SSD", "STORAGE"].includes(
          component.nFilsCategs
        )
      ) {
        return true;
      }
      const price = component.price;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Store the filtered components for the current component type
    filteredComponents[componentType] = filteredComponentsForType.slice(0, 5);
  }

  return filteredComponents;
}
