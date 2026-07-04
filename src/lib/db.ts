import fs from "fs";
import path from "path";

export interface RestaurantInfo {
  name: string;
  phone: string[];
  address: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  banner?: string;
  order: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  image: string;
  ingredients: string;
  available: boolean;
  order: number;
}

export interface MenuData {
  restaurant: RestaurantInfo;
  categories: Category[];
  items: MenuItem[];
}

const DATA_PATH = path.join(process.cwd(), "data", "menu.json");

export function readData(): MenuData {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

export function writeData(data: MenuData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}
