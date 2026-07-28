import type { MenuData } from "@/lib/db";
import defaultData from "../../data/menu.json";
import MenuClient from "./MenuClient";

async function getInitialData(): Promise<MenuData> {
  try {
    const { readData } = await import("@/lib/db");
    return await readData();
  } catch {
    return defaultData as MenuData;
  }
}

export default async function MenuPage() {
  const initialData = await getInitialData();
  return <MenuClient initialData={initialData} />;
}
