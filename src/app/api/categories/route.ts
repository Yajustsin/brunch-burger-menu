import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/db";
import { isAdmin } from "@/lib/adminCheck";
import { v4 as uuid } from "uuid";
import { deleteBlobImage, isVercelBlobUrl } from "@/lib/blob";

export async function GET() {
  const data = await readData();
  return NextResponse.json(data.categories);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = await readData();
  const maxOrder = data.categories.length > 0 ? Math.max(...data.categories.map((c) => c.order)) : 0;

  const newCat = {
    id: uuid(),
    name: body.name,
    banner: body.banner || "",
    order: maxOrder + 1,
  };

  data.categories.push(newCat);

  try {
    await writeData(data);
    return NextResponse.json(newCat, { status: 201 });
  } catch (error) {
    if (newCat.banner && isVercelBlobUrl(newCat.banner)) {
      await deleteBlobImage(newCat.banner);
    }
    throw error;
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = await readData();

  if (body.reorder) {
    for (const { id, order } of body.reorder) {
      const cat = data.categories.find((c) => c.id === id);
      if (cat) cat.order = order;
    }
    await writeData(data);
    return NextResponse.json({ ok: true });
  }

  const idx = data.categories.findIndex((c) => c.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oldCat = data.categories[idx];
  const oldBanner = oldCat.banner;
  const newBanner = body.banner !== undefined ? body.banner : oldCat.banner;

  data.categories[idx] = { ...data.categories[idx], ...body };

  try {
    await writeData(data);
    if (oldBanner && oldBanner !== newBanner && isVercelBlobUrl(oldBanner)) {
      await deleteBlobImage(oldBanner);
    }
    return NextResponse.json(data.categories[idx]);
  } catch (error) {
    if (newBanner && newBanner !== oldBanner && isVercelBlobUrl(newBanner)) {
      await deleteBlobImage(newBanner);
    }
    throw error;
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const data = await readData();
  const catToDelete = data.categories.find((c) => c.id === id);
  const itemsToDelete = data.items.filter((i) => i.categoryId === id);

  data.categories = data.categories.filter((c) => c.id !== id);
  data.items = data.items.filter((i) => i.categoryId !== id);

  await writeData(data);

  if (catToDelete?.banner && isVercelBlobUrl(catToDelete.banner)) {
    await deleteBlobImage(catToDelete.banner);
  }

  for (const item of itemsToDelete) {
    if (item.image && isVercelBlobUrl(item.image)) {
      await deleteBlobImage(item.image);
    }
  }

  return NextResponse.json({ ok: true });
}
