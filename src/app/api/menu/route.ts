import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import { isAdmin } from "@/lib/adminCheck";
import { v4 as uuid } from "uuid";

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = await readData();

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
    discount: body.discount ? Number(body.discount) : 0,
  };

  data.items.push(newItem);
  await writeData(data);
  return NextResponse.json(newItem, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = await readData();

  if (body.restaurant) {
    data.restaurant = { ...data.restaurant, ...body.restaurant };
    await writeData(data);
    return NextResponse.json(data.restaurant);
  }

  if (body.reorder) {
    for (const { id, order } of body.reorder) {
      const item = data.items.find((i) => i.id === id);
      if (item) item.order = order;
    }
    await writeData(data);
    return NextResponse.json({ ok: true });
  }

  const idx = data.items.findIndex((i) => i.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Handle number type conversion for discount if updated
  const updatedItem = { ...body };
  if (updatedItem.discount !== undefined) {
    updatedItem.discount = Number(updatedItem.discount) || 0;
  }
  if (updatedItem.price !== undefined) {
    updatedItem.price = Number(updatedItem.price);
  }

  data.items[idx] = { ...data.items[idx], ...updatedItem };
  await writeData(data);
  return NextResponse.json(data.items[idx]);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const data = await readData();
  data.items = data.items.filter((i) => i.id !== id);
  await writeData(data);
  return NextResponse.json({ ok: true });
}
