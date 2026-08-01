import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminCheck";
import { put } from "@vercel/blob";
import { v4 as uuid } from "uuid";
import { deleteBlobImage } from "@/lib/blob";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function getExtension(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return parts.pop()?.toLowerCase() || "";
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "فایلی انتخاب نشده است" }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "فایل انتخابی صفربایت (خالی) است" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "حجم فایل نباید بیشتر از ۵ مگابایت باشد" },
        { status: 400 }
      );
    }

    const ext = getExtension(file.name);
    const mimeType = file.type?.toLowerCase() || "";

    const isMimeValid = ALLOWED_MIME_TYPES.includes(mimeType);
    const isExtValid = ALLOWED_EXTENSIONS.includes(ext);

    if (!isMimeValid && !isExtValid) {
      return NextResponse.json(
        { error: "فرمت فایل نامعتبر است. فقط فرمت‌های WebP، PNG و JPG پشتیبانی می‌شوند." },
        { status: 400 }
      );
    }

    const safeExt = isExtValid ? ext : "webp";
    const filename = `uploads/${uuid()}.${safeExt}`;
    const contentType = file.type || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType,
    });

    return NextResponse.json(
      {
        url: blob.url,
        pathname: blob.pathname,
        size: file.size,
        contentType,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "خطای ناشناخته در آپلود فایل";
    console.error("Vercel Blob upload error:", error);
    return NextResponse.json({ error: `خطا در آپلود: ${errMessage}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "آدرس فایل مشخص نشده است" }, { status: 400 });
    }

    await deleteBlobImage(url);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "خطا در حذف فایل";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
