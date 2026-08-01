"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Category, MenuItem, RestaurantInfo } from "@/lib/db";

// ─── helpers ───
function formatPrice(p: number) {
  return p.toLocaleString("fa-IR");
}

// ─── Login ───
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      onLogin();
    } else {
      setErr("رمز اشتباه است");
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-navy-900 rounded-2xl p-6">
        <h1 className="text-xl font-bold text-navy-100 mb-6 text-center">ورود به پنل مدیریت</h1>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="رمز عبور"
          className="w-full rounded-xl bg-navy-800 border border-navy-700 text-navy-100 px-4 py-3 mb-4 outline-none focus:border-navy-500 placeholder:text-navy-600"
        />
        {err && <p className="text-red-400 text-sm mb-3">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-navy-600 text-white py-3 font-medium hover:bg-navy-500 transition disabled:opacity-50"
        >
          {loading ? "..." : "ورود"}
        </button>
      </form>
    </div>
  );
}

// ─── Image upload button ───
function ImageUpload({
  current,
  onChange,
}: {
  current: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    if (file.size === 0) {
      setError("فایل انتخابی صفربایت (خالی) است");
      setUploading(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
      setUploading(false);
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "خطا در آپلود تصویر");
      } else if (data.url) {
        onChange(data.url);
        setError(null);
      } else {
        setError("پاسخ آپلود سرور نامعتبر است");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در آپلود تصویر";
      setError(msg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {current ? (
          <img
            src={current}
            alt="پیش‌نمایش تصویر"
            className="w-16 h-16 rounded-lg object-cover border border-navy-700 bg-navy-800 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21 15 16 10 5 21'/></svg>";
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-navy-800 border border-navy-700/60 flex items-center justify-center text-navy-500 text-xs shrink-0">
            بدون عکس
          </div>
        )}
        <label className="cursor-pointer text-sm bg-navy-800 border border-navy-700 text-navy-200 hover:text-white hover:bg-navy-700 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5">
          {uploading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-navy-300 border-t-transparent rounded-full animate-spin inline-block" />
              <span>در حال آپلود...</span>
            </>
          ) : (
            <span>{current ? "تغییر عکس" : "انتخاب عکس"}</span>
          )}
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
        {current && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-red-400 text-xs hover:text-red-300 transition px-2 py-1"
          >
            حذف عکس
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
      {current && (
        <p className="text-[10px] text-navy-400 font-mono truncate max-w-full dir-ltr text-right" title={current}>
          {current}
        </p>
      )}
    </div>
  );
}

// ─── Item Form Modal ───
function ItemFormModal({
  item,
  categories,
  onSave,
  onClose,
}: {
  item: Partial<MenuItem> | null;
  categories: Category[];
  onSave: (data: Partial<MenuItem>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: item?.name || "",
    price: item?.price?.toString() || "",
    categoryId: item?.categoryId || categories[0]?.id || "",
    ingredients: item?.ingredients || "",
    image: item?.image || "",
    discount: item?.discount?.toString() || "",
  });
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    try {
      await onSave({
        ...item,
        name: form.name,
        price: Number(form.price),
        categoryId: form.categoryId,
        ingredients: form.ingredients,
        image: form.image,
        discount: form.discount ? Number(form.discount) : 0,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ذخیره‌سازی آیتم";
      setSaveError(msg);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-navy-900 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg font-bold text-navy-100">
          {item?.id ? "ویرایش آیتم" : "آیتم جدید"}
        </h2>

        {saveError && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-xl">
            {saveError}
          </div>
        )}

        <div>
          <label className="text-navy-400 text-sm block mb-1">نام</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full rounded-xl bg-navy-800 border border-navy-700 text-navy-100 px-4 py-2.5 outline-none focus:border-navy-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-navy-400 text-sm block mb-1">قیمت (تومان)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              className="w-full rounded-xl bg-navy-800 border border-navy-700 text-navy-100 px-4 py-2.5 outline-none focus:border-navy-500"
            />
          </div>
          <div>
            <label className="text-navy-400 text-sm block mb-1">تخفیف (درصد)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
              placeholder="مثلا ۱۰"
              className="w-full rounded-xl bg-navy-800 border border-navy-700 text-navy-100 px-4 py-2.5 outline-none focus:border-navy-500"
            />
          </div>
        </div>

        <div>
          <label className="text-navy-400 text-sm block mb-1">دسته‌بندی</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full rounded-xl bg-navy-800 border border-navy-700 text-navy-100 px-4 py-2.5 outline-none focus:border-navy-500"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-navy-400 text-sm block mb-1">ترکیبات</label>
          <textarea
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            rows={2}
            className="w-full rounded-xl bg-navy-800 border border-navy-700 text-navy-100 px-4 py-2.5 outline-none focus:border-navy-500 resize-none"
          />
        </div>

        <div>
          <label className="text-navy-400 text-sm block mb-1">تصویر</label>
          <ImageUpload current={form.image} onChange={(url) => setForm({ ...form, image: url })} />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-navy-600 text-white py-2.5 font-medium hover:bg-navy-500 transition"
          >
            ذخیره
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-navy-800 text-navy-400 py-2.5 font-medium hover:bg-navy-700 transition"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Category Form Modal ───
function CategoryFormModal({
  category,
  onSave,
  onClose,
}: {
  category: Partial<Category> | null;
  onSave: (data: Partial<Category>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [banner, setBanner] = useState(category?.banner || "");
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    try {
      await onSave({ ...category, name, banner });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در ذخیره‌سازی دسته‌بندی";
      setSaveError(msg);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-navy-900 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-lg font-bold text-navy-100">
          {category?.id ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
        </h2>

        {saveError && (
          <div className="bg-red-950/60 border border-red-800 text-red-300 text-xs p-3 rounded-xl">
            {saveError}
          </div>
        )}

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="نام دسته‌بندی"
          className="w-full rounded-xl bg-navy-800 border border-navy-700 text-navy-100 px-4 py-2.5 outline-none focus:border-navy-500"
        />
        <div>
          <p className="text-navy-400 text-xs mb-2">عکس دسته‌بندی (بنر)</p>
          <ImageUpload current={banner} onChange={setBanner} />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-navy-600 text-white py-2.5 font-medium hover:bg-navy-500 transition"
          >
            ذخیره
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-navy-800 text-navy-400 py-2.5 font-medium hover:bg-navy-700 transition"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Admin Page ───
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [itemModal, setItemModal] = useState<Partial<MenuItem> | null | false>(false);
  const [catModal, setCatModal] = useState<Partial<Category> | null | false>(false);
  const [rest, setRest] = useState<RestaurantInfo | null>(null);
  const [restSaved, setRestSaved] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/menu");
    if (!res.ok) return;
    const data = await res.json();
    const cats = (data.categories as Category[]).sort((a, b) => a.order - b.order);
    setCategories(cats);
    setItems(data.items as MenuItem[]);
    setRest(data.restaurant as RestaurantInfo);
    setActiveCategory((prev) => prev || cats[0]?.id || null);
  }, []);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => {
        if (r.ok) {
          setAuthed(true);
          load();
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [load]);

  async function saveRestaurant() {
    if (!rest) return;
    const res = await fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant: rest }),
    });
    if (!res.ok) {
      alert("خطا در ذخیره متن‌های اصلی");
      return;
    }
    setRestSaved(true);
    setTimeout(() => setRestSaved(false), 2000);
  }

  // ─── Item CRUD ───
  async function saveItem(data: Partial<MenuItem>) {
    const res = await fetch("/api/menu", {
      method: data.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "خطا در ذخیره‌سازی آیتم");
    }

    setItemModal(false);
    await load();
  }

  async function deleteItem(id: string) {
    if (!confirm("حذف این آیتم؟")) return;
    const res = await fetch("/api/menu", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      alert("خطا در حذف آیتم");
      return;
    }
    load();
  }

  async function toggleAvailable(item: MenuItem) {
    const res = await fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, available: !item.available }),
    });
    if (!res.ok) {
      alert("خطا در تغییر وضعیت موجودی");
      return;
    }
    load();
  }

  async function moveItem(item: MenuItem, direction: -1 | 1) {
    const catItems = items
      .filter((i) => i.categoryId === item.categoryId)
      .sort((a, b) => a.order - b.order);
    const idx = catItems.findIndex((i) => i.id === item.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= catItems.length) return;

    const reorder = catItems.map((it, i) => {
      if (i === idx) return { id: it.id, order: catItems[swapIdx].order };
      if (i === swapIdx) return { id: it.id, order: catItems[idx].order };
      return { id: it.id, order: it.order };
    });

    const res = await fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reorder }),
    });
    if (!res.ok) {
      alert("خطا در جابه‌جایی ترتیب آیتم");
      return;
    }
    load();
  }

  // ─── Category CRUD ───
  async function saveCategory(data: Partial<Category>) {
    const res = await fetch("/api/categories", {
      method: data.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "خطا در ذخیره‌سازی دسته‌بندی");
    }

    setCatModal(false);
    await load();
  }

  async function deleteCategory(id: string) {
    if (!confirm("حذف این دسته‌بندی و تمام آیتم‌هایش؟")) return;
    const res = await fetch("/api/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      alert("خطا در حذف دسته‌بندی");
      return;
    }
    load();
  }

  async function moveCategory(cat: Category, direction: -1 | 1) {
    const idx = categories.findIndex((c) => c.id === cat.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= categories.length) return;

    const reorder = categories.map((c, i) => {
      if (i === idx) return { id: c.id, order: categories[swapIdx].order };
      if (i === swapIdx) return { id: c.id, order: categories[idx].order };
      return { id: c.id, order: c.order };
    });

    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reorder }),
    });
    if (!res.ok) {
      alert("خطا در جابه‌جایی دسته‌بندی");
      return;
    }
    load();
  }

  if (checking) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onLogin={() => setAuthed(true)} />;
  }

  const filteredItems = items
    .filter((i) => i.categoryId === activeCategory)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-ink-900">پنل مدیریت</h1>
        <Link href="/" className="text-navy-400 text-sm hover:text-navy-200 transition">
          مشاهده منو ←
        </Link>
      </div>

      {/* Restaurant texts */}
      {rest && (
        <section className="mb-6 bg-navy-900 rounded-xl p-4 border border-navy-700/40">
          <h2 className="text-base font-bold text-ink-700 mb-3">متن‌های اصلی قالب</h2>
          <div className="grid gap-3">
            <input
              value={rest.name}
              onChange={(e) => setRest({ ...rest, name: e.target.value })}
              placeholder="نام رستوران"
              className="bg-navy-800 border border-navy-700 rounded-lg px-3 py-2 text-sm text-navy-100"
            />
            <input
              value={rest.phone.join("، ")}
              onChange={(e) => setRest({ ...rest, phone: e.target.value.split(/[،,]/).map((x) => x.trim()).filter(Boolean) })}
              placeholder="شماره‌ها (با ویرگول جدا کن)"
              className="bg-navy-800 border border-navy-700 rounded-lg px-3 py-2 text-sm text-navy-100 ltr text-left"
            />
            <textarea
              value={rest.address}
              onChange={(e) => setRest({ ...rest, address: e.target.value })}
              placeholder="آدرس"
              rows={2}
              className="bg-navy-800 border border-navy-700 rounded-lg px-3 py-2 text-sm text-navy-100 resize-none"
            />
            <button
              onClick={saveRestaurant}
              className="bg-navy-600 hover:bg-navy-500 transition text-white text-sm rounded-lg py-2 font-medium"
            >
              {restSaved ? "ذخیره شد ✓" : "ذخیره متن‌ها"}
            </button>
          </div>
        </section>
      )}

      {/* Categories management */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-ink-700">دسته‌بندی‌ها</h2>
          <button
            onClick={() => setCatModal({})}
            className="text-sm bg-navy-700 text-navy-200 px-4 py-1.5 rounded-lg hover:bg-navy-600 transition"
          >
            + جدید
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className={`flex items-center gap-2 rounded-xl p-3 transition cursor-pointer ${
                activeCategory === cat.id ? "bg-navy-800 ring-1 ring-navy-600" : "bg-navy-900/60 hover:bg-navy-900"
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); moveCategory(cat, -1); }}
                  disabled={idx === 0}
                  className="text-navy-500 hover:text-navy-300 disabled:opacity-20 text-xs"
                >
                  ▲
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveCategory(cat, 1); }}
                  disabled={idx === categories.length - 1}
                  className="text-navy-500 hover:text-navy-300 disabled:opacity-20 text-xs"
                >
                  ▼
                </button>
              </div>
              <span className="flex-1 text-navy-200 font-medium">{cat.name}</span>
              <span className="text-navy-600 text-xs">
                {items.filter((i) => i.categoryId === cat.id).length} آیتم
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setCatModal(cat); }}
                className="text-navy-500 hover:text-navy-300 text-sm px-2"
              >
                ✎
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }}
                className="text-red-500/60 hover:text-red-400 text-sm px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Items management */}
      {activeCategory && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-ink-700">
              آیتم‌های {categories.find((c) => c.id === activeCategory)?.name}
            </h2>
            <button
              onClick={() => setItemModal({ categoryId: activeCategory })}
              className="text-sm bg-navy-700 text-navy-200 px-4 py-1.5 rounded-lg hover:bg-navy-600 transition"
            >
              + جدید
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {filteredItems.length === 0 ? (
              <p className="text-navy-600 text-center py-8">آیتمی وجود ندارد</p>
            ) : (
              filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl p-3 ${
                    item.available ? "bg-navy-900/60" : "bg-navy-900/30 opacity-60"
                  }`}
                >
                  {/* Sort arrows */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveItem(item, -1)}
                      disabled={idx === 0}
                      className="text-navy-500 hover:text-navy-300 disabled:opacity-20 text-xs"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveItem(item, 1)}
                      disabled={idx === filteredItems.length - 1}
                      className="text-navy-500 hover:text-navy-300 disabled:opacity-20 text-xs"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Thumbnail */}
                  {item.image ? (
                    <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-navy-800 shrink-0" />
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-navy-100 font-medium truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-navy-400 text-sm">{formatPrice(item.price)} تومان</p>
                      {item.discount ? (
                        <span className="text-[10px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-bold">
                          {item.discount}٪ تخفیف
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => toggleAvailable(item)}
                    className={`text-xs px-3 py-1 rounded-full transition ${
                      item.available
                        ? "bg-green-900/40 text-green-400"
                        : "bg-red-900/40 text-red-400"
                    }`}
                  >
                    {item.available ? "موجود" : "ناموجود"}
                  </button>
                  <button
                    onClick={() => setItemModal(item)}
                    className="text-navy-500 hover:text-navy-300 text-sm px-1"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-red-500/60 hover:text-red-400 text-sm px-1"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Modals */}
      {itemModal !== false && (
        <ItemFormModal
          item={itemModal}
          categories={categories}
          onSave={saveItem}
          onClose={() => setItemModal(false)}
        />
      )}
      {catModal !== false && (
        <CategoryFormModal
          category={catModal}
          onSave={saveCategory}
          onClose={() => setCatModal(false)}
        />
      )}
    </div>
  );
}
