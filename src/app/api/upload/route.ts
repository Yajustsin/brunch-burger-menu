import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminCheck";
import { v4 as uuid } from "uuid";

const OWNER = process.env.GITHUB_OWNER || "Yajustsin";
const REPO = process.env.GITHUB_REPO || "brunch-burger-menu";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN || "";

const headers: HeadersInit = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

function extOf(name: string): string {
  const ext = name.split(".").pop();
  if (!ext) return "jpg";
  const e = ext.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(e) ? e : "jpg";
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${uuid()}.${extOf(file.name)}`;
  const uploadPath = `public/uploads/${filename}`;

  const body = {
    message: "chore: upload image",
    branch: BRANCH,
    content: buffer.toString("base64"),
  };

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(uploadPath)}?ref=${encodeURIComponent(
      BRANCH
    )}`,
    {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `GitHub upload failed: ${res.status} ${err}` }, { status: 500 });
  }

  const json = await res.json();
  const url = json.content?.raw_url || `/uploads/${filename}`;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const clean = url.replace(/^https:\/\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/[^/]+/, base);
  return NextResponse.json({ url: clean });
}
