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
  discount?: number;
}

export interface MenuData {
  restaurant: RestaurantInfo;
  categories: Category[];
  items: MenuItem[];
}

const OWNER = process.env.GITHUB_OWNER || "Yajustsin";
const REPO = process.env.GITHUB_REPO || "brunch-burger-menu";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const PATH = process.env.GITHUB_DATA_PATH || "data/menu.json";
const TOKEN = process.env.GITHUB_TOKEN || "";

const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${encodeURIComponent(
  BRANCH
)}`;

const headers: HeadersInit = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export async function readData(): Promise<MenuData> {
  const res = await fetch(API, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`GitHub readData failed: ${res.status}`);
  const body = await res.json();
  const content = Buffer.from(body.content, "base64").toString("utf-8");
  return JSON.parse(content);
}

export async function readDataSync(): Promise<MenuData> {
  return readData();
}

export async function writeData(data: MenuData): Promise<void> {
  const res = await fetch(API, { headers, cache: "no-store" });
  let sha: string | undefined;
  if (res.ok) {
    sha = (await res.json()).sha;
  }
  const body = {
    message: "chore: update menu.json from admin",
    branch: BRANCH,
    content: Buffer.from(JSON.stringify(data, null, 2), "utf-8").toString("base64"),
    ...(sha ? { sha } : {}),
  };
  const updateRes = await fetch(API, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!updateRes.ok) {
    const err = await updateRes.text();
    throw new Error(`GitHub writeData failed: ${updateRes.status} ${err}`);
  }
}
