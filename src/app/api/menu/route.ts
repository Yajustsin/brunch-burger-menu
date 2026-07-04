import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import { isAdmin } from "@/lib/adminCheck";
import { v4 as uuid } from "uuid";

export async function GET() {
  const data = readData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = readData();

  const categoryItems = data.items.filter((i) => i.categoryId === body.categoryId);
  const maxOrder = categoryItems.length > 0 ? Math.max(...categoryItems.map((i) => i.order)) : 0;

  const newItem = {
    id: uuid(),
    categoryId: body.categoryId,
    name: body.name,
    price: Number(body.price),
    image: body.image || "",
    ingredients: body.ingredients || "",
    available: true,
    order: maxOrder + 1,
  };

  data.items.push(newItem);
  writeData(data);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = readData();

  if (body.restaurant) {
    data.restaurant = { ...data.restaurant, ...body.restaurant };
    writeData(data);
    return NextResponse.json(data.restaurant);
  }

  if (body.reorder) {
    for (const { id, order } of body.reorder) {
      const item = data.items.find((i) => i.id === id);
      if (item) item.order = order;
    }
    writeData(data);
    return NextResponse.json({ ok: true });
  }

  const idx = data.items.findIndex((i) => i.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  data.items[idx] = { ...data.items[idx], ...body };
  writeData(data);
  return NextResponse.json(data.items[idx]);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const data = readData();
  data.items = data.items.filter((i) => i.id !== id);
  writeData(data);
  return NextResponse.json({ ok: true });
}
