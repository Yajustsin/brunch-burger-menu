import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import { isAdmin } from "@/lib/adminCheck";
import { v4 as uuid } from "uuid";

export async function GET() {
  const data = readData();
  return NextResponse.json(data.categories);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = readData();
  const maxOrder = data.categories.length > 0 ? Math.max(...data.categories.map((c) => c.order)) : 0;

  const newCat = {
    id: uuid(),
    name: body.name,
    banner: body.banner || "",
    order: maxOrder + 1,
  };

  data.categories.push(newCat);
  writeData(data);
  return NextResponse.json(newCat, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = readData();

  if (body.reorder) {
    for (const { id, order } of body.reorder) {
      const cat = data.categories.find((c) => c.id === id);
      if (cat) cat.order = order;
    }
    writeData(data);
    return NextResponse.json({ ok: true });
  }

  const idx = data.categories.findIndex((c) => c.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  data.categories[idx] = { ...data.categories[idx], ...body };
  writeData(data);
  return NextResponse.json(data.categories[idx]);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const data = readData();
  data.categories = data.categories.filter((c) => c.id !== id);
  data.items = data.items.filter((i) => i.categoryId !== id);
  writeData(data);
  return NextResponse.json({ ok: true });
}
