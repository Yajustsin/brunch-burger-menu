"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Category, MenuItem, RestaurantInfo } from "@/lib/db";

/* ── SVG Icons per category ── */
function CategoryIcon({ id, className = "" }: { id: string; className?: string }) {
  const cls = `${className}`;
  switch (id) {
    case "cat-burgers":
      return (
        <svg className={cls} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 17h20M5 17c0-6 3-9 11-9s11 3 11 9" />
          <path d="M5 17c-.5 0-1 .5-1 1.5S4.5 20 5 20h22c.5 0 1-.5 1-1.5s-.5-1.5-1-1.5" />
          <path d="M6 20l-1 3c-.2.6.2 1 .8 1h20.4c.6 0 1-.4.8-1l-1-3" />
          <circle cx="11" cy="14" r="0.5" fill="currentColor" stroke="none" />
          <circle cx="16" cy="12.5" r="0.5" fill="currentColor" stroke="none" />
          <circle cx="21" cy="14" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "cat-sandwich":
      return (
        <svg className={cls} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20l12-12 12 12" />
          <path d="M4 20h24" />
          <path d="M6 20v3c0 .6.4 1 1 1h18c.6 0 1-.4 1-1v-3" />
          <path d="M8 16l4 4M14 14l4 4M20 16l3 3" />
        </svg>
      );
    case "cat-pizza-american":
    case "cat-pizza-neapolitan":
      return (
        <svg className={cls} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4L4 28h24L16 4z" />
          <circle cx="14" cy="18" r="1.5" />
          <circle cx="19" cy="22" r="1.5" />
          <circle cx="16" cy="13" r="1" />
          <path d="M8.5 24h15" />
        </svg>
      );
    case "cat-pasta":
      return (
        <svg className={cls} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 14c0 6 3.5 10 8 10s8-4 8-10" />
          <path d="M6 14h20" />
          <path d="M10 8c1 3 1 6 0 6M16 6c0 4 0 8 0 8M22 8c-1 3-1 6 0 6" />
        </svg>
      );
    case "cat-appetizer":
      return (
        <svg className={cls} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="16" cy="20" rx="10" ry="5" />
          <path d="M6 20c0-7 4-12 10-12s10 5 10 12" />
          <path d="M12 16c1-2 3-3 4-2M18 14c1 0 2 1 2 2" />
        </svg>
      );
    case "cat-fries":
      return (
        <svg className={cls} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 16h12l2 10H8l2-10z" />
          <path d="M12 16V8M16 16V6M20 16V8" />
          <path d="M14 16V10M18 16V9" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="16" r="10" />
          <path d="M12 16h8M16 12v8" />
        </svg>
      );
  }
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const asset = (p: string) => (p && p.startsWith("/") ? BASE + p : p);

function formatPrice(price: number) {
  return price.toLocaleString("fa-IR");
}

const CATEGORY_NOTES: Record<string, string> = {
  "cat-burgers": "تمامی برگرها همراه با سیب زمینی",
  "cat-pizza-american": "۲۸ سانتی‌متر",
  "cat-pizza-neapolitan": "۳۲ سانتی‌متر",
};

const CATEGORY_BANNERS: Record<string, string> = {
  "cat-burgers": "/uploads/banners/burger.png",
  "cat-sandwich": "/uploads/banners/sandwich.png",
  "cat-pizza-american": "/uploads/banners/pizza-american.png",
  "cat-pizza-neapolitan": "/uploads/banners/pizza-neapolitan.png",
  "cat-pasta": "/uploads/banners/pasta.png",
  "cat-appetizer": "/uploads/banners/appetizer.png",
  "cat-fries": "/uploads/banners/fries.png",
};

/* ── Parallax doodle background ── */
const DOODLES: { id: string; top: string; left: string; size: number; speed: number; rotate: number }[] = [
  { id: "cat-burgers", top: "12%", left: "6%", size: 54, speed: 0.12, rotate: -14 },
  { id: "cat-fries", top: "22%", left: "82%", size: 48, speed: 0.2, rotate: 10 },
  { id: "cat-pizza-american", top: "38%", left: "12%", size: 44, speed: 0.28, rotate: 18 },
  { id: "cat-pasta", top: "52%", left: "86%", size: 52, speed: 0.15, rotate: -8 },
  { id: "cat-sandwich", top: "66%", left: "8%", size: 46, speed: 0.24, rotate: 12 },
  { id: "cat-appetizer", top: "80%", left: "78%", size: 50, speed: 0.1, rotate: -18 },
  { id: "cat-fries", top: "92%", left: "18%", size: 40, speed: 0.3, rotate: 24 },
];

function DoodleBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        ref.current?.querySelectorAll<HTMLElement>("[data-speed]").forEach((el, i) => {
          const s = parseFloat(el.dataset.speed!);
          const r = parseFloat(el.dataset.rotate!);
          const sway = Math.sin(y / 180 + i * 1.7) * 14;
          el.style.transform = `translate(${sway}px, ${-y * s}px) rotate(${r + y * (0.06 + s * 0.2) * (i % 2 ? 1 : -1)}deg)`;
        });
        const banner = document.getElementById("cat-banner");
        if (banner) banner.style.transform = `rotate(${y * 0.15}deg)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      {DOODLES.map((d, i) => (
        <div
          key={i}
          data-speed={d.speed}
          data-rotate={d.rotate}
          className="absolute text-ink-800/15 will-change-transform"
          style={{ top: d.top, left: d.left, width: d.size, height: d.size, transform: `rotate(${d.rotate}deg)` }}
        >
          <CategoryIcon id={d.id} className="w-full h-full" />
        </div>
      ))}
    </div>
  );
}

/* ── Scroll reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    const items = ref.current.querySelectorAll(".reveal");
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });

  return ref;
}

/* ── Menu Item Card ── */
function MenuItemCard({ item, categoryId, delay = 0 }: { item: MenuItem; categoryId: string; delay?: number }) {
  const [open, setOpen] = useState(false);

  const hasDiscount = !!item.discount && item.discount > 0 && item.discount <= 100;
  const discountedPrice = hasDiscount ? Math.round(item.price * (1 - item.discount! / 100)) : item.price;

  return (
    <>
      <button
        onClick={() => item.ingredients && setOpen(true)}
        className="reveal paper-card flex items-center gap-4 rounded-2xl p-3.5 text-right transition-all duration-300 w-full active:scale-[0.985] group"
        style={{ transitionDelay: `${delay}ms` }}
      >
        {item.image && (
          <img
            src={asset(item.image)}
            alt={item.name}
            className="h-[68px] w-[68px] rounded-xl object-cover shrink-0 ring-1 ring-ink-900/15"
          />
        )}

        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center">
            <div className="flex items-center gap-1.5 shrink-0">
              <h3 className="font-bold text-ink-900 text-[15px] leading-6">{item.name}</h3>
              {hasDiscount && (
                <span className="bg-accent-600 text-paper-50 text-[10px] px-1.5 py-0.5 rounded-md font-black animate-pulse">
                  {item.discount}٪
                </span>
              )}
            </div>
            <span className="leader" />
            <div className="flex flex-col items-end shrink-0 gap-0.5">
              {hasDiscount && (
                <span className="text-ink-400 line-through text-[11px] font-medium leading-none">
                  {formatPrice(item.price)}
                </span>
              )}
              <span className="price-tag shrink-0">{formatPrice(discountedPrice)}</span>
            </div>
          </div>
          {item.ingredients && (
            <p className="text-ink-500 text-[11px] mt-1.5 line-clamp-1 leading-5">
              {item.ingredients}
            </p>
          )}
        </div>
      </button>

      {/* ── Detail Sheet ── */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sheet-overlay"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg rounded-t-3xl bg-paper-50 border-t-2 border-ink-800/60 shadow-[0_-8px_40px_rgba(22,35,63,0.3)] sheet-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-ink-900/20" />
            </div>

            <div className="p-6 pb-10">
              {item.image && (
                <img src={asset(item.image)} alt={item.name}
                  className="w-full h-52 rounded-2xl object-cover mb-5 ring-1 ring-ink-900/10" />
              )}

              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-ink-900">{item.name}</h2>
                  {hasDiscount && (
                    <span className="bg-accent-600 text-paper-50 text-xs px-2 py-0.5 rounded-md font-black">
                      {item.discount}٪ تخفیف
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {hasDiscount && (
                    <span className="text-ink-400 line-through text-xs font-bold">
                      {formatPrice(item.price)}
                    </span>
                  )}
                  <span className="price-tag text-sm">
                    {formatPrice(discountedPrice)}
                    <span className="font-normal text-[10px] opacity-70 mr-1">تومان</span>
                  </span>
                </div>
              </div>

              <div className="bg-white/40 rounded-xl p-4 border border-ink-900/10">
                <h4 className="text-accent-600 text-xs font-bold mb-2">ترکیبات</h4>
                <p className="text-ink-700 text-sm leading-7">{item.ingredients}</p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="mt-5 w-full rounded-xl bg-ink-800 py-3.5 text-paper-100 font-bold hover:bg-ink-700 transition active:scale-[0.98]"
              >
                بستن
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

/* ── Main Page ── */
export default function MenuPage() {
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);
  const revealRef = useReveal();

  useEffect(() => {
    fetch(BASE + "/api/menu")
      .then((r) => (r.ok ? r.json() : fetch(BASE + "/menu-data.json").then((x) => x.json())))
      .catch(() => fetch(BASE + "/menu-data.json").then((x) => x.json()))
      .then((data) => {
        setRestaurant(data.restaurant);
        const cats = (data.categories as Category[]).sort((a, b) => a.order - b.order);
        setCategories(cats);
        setItems(data.items as MenuItem[]);
        if (cats.length > 0) setActiveCategory(cats[0].id);
        setLoading(false);
      });
  }, []);

  const scrollToTab = useCallback((catId: string) => {
    if (!tabsRef.current) return;
    const btn = tabsRef.current.querySelector(`[data-cat="${catId}"]`) as HTMLElement;
    if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  useEffect(() => {
    if (activeCategory) scrollToTab(activeCategory);
  }, [activeCategory, scrollToTab]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-ink-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredItems = items
    .filter((i) => i.categoryId === activeCategory && i.available)
    .sort((a, b) => a.order - b.order);

  const activeCat = categories.find((c) => c.id === activeCategory);
  const catNote = activeCategory ? CATEGORY_NOTES[activeCategory] : null;

  return (
    <div className="flex-1 flex flex-col max-w-lg mx-auto w-full relative z-10" ref={revealRef}>
      <DoodleBackground />

      {/* ═══ Header ═══ */}
      <header className="sticky top-0 z-40 paper-header">
        <div className="pt-5 pb-3 px-5">
          <div className="text-center mb-4">
            <h1 className="text-[28px] font-black tracking-[0.06em] text-ink-900 leading-none">
              <span style={{ color: "#f5c518" }}>B</span>RUNCH{" "}
              <span style={{ color: "#f5c518" }}>B</span>URGER
            </h1>
            {restaurant && (
              <p className="ltr text-ink-500 text-[11px] mt-2 tracking-wider">
                {restaurant.phone.join("  ·  ")}
              </p>
            )}
          </div>

          {/* Category tabs */}
          <div ref={tabsRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide tabs-scroll">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  data-cat={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-bold transition-all duration-250 flex items-center gap-2 shrink-0 border-2 ${
                    isActive
                      ? "bg-ink-800 text-paper-100 border-ink-800 shadow-[2px_2px_0_rgba(22,35,63,0.25)]"
                      : "bg-transparent text-ink-700 border-ink-900/20 hover:border-ink-900/50"
                  }`}
                >
                  <CategoryIcon id={cat.id} className={`w-4 h-4 ${isActive ? "text-paper-200" : "text-ink-600"}`} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="marquee py-1.5">
          <div className="marquee-track text-[10px] font-bold tracking-[0.3em]">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="whitespace-nowrap shrink-0">
                {"BRUNCH BURGER \u25CF FAST FOOD \u25CF SINCE 2024 \u25CF ".repeat(4)}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ═══ Category Banner + Header ═══ */}
      {activeCat && activeCategory && (activeCat.banner || CATEGORY_BANNERS[activeCategory]) && (
        <div key={`banner-${activeCategory}`} className="sticky top-[182px] z-0 pt-6 pb-2 flex justify-center items-center relative overflow-hidden w-full">
          {activeCat.nameEn && (
            <span className="outline-type absolute inset-x-0 top-10 text-center text-[64px] leading-none uppercase pointer-events-none" aria-hidden>
              {activeCat.nameEn.split(" ")[0]}
            </span>
          )}
          <img
            id="cat-banner"
            src={asset(activeCat.banner || CATEGORY_BANNERS[activeCategory])}
            alt={activeCat.name}
            className="h-44 w-auto object-contain will-change-transform"
          />
        </div>
      )}
      {activeCat && (
        <div className="sticky top-[182px] z-20 paper-header px-5 py-2.5" style={{ borderBottomWidth: 0 }}>
          <div className="flex items-center justify-between">
            <h2 className="font-black text-ink-900 text-xl">{activeCat.name}</h2>
            <div className="flex items-center gap-2">
              {catNote && (
                <span className="text-accent-600 text-[11px] font-bold">{catNote}</span>
              )}
              {activeCat.nameEn && (
                <span className="text-ink-400 text-[10px] font-bold tracking-widest uppercase">
                  {activeCat.nameEn}
                </span>
              )}
            </div>
          </div>
          <div className="ink-line mt-2" />
        </div>
      )}

      {/* ═══ Items ═══ */}
      <main className="flex-1 px-4 pb-10 relative z-10">
        <div className="flex flex-col gap-2.5 mt-4" key={activeCategory}>
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-10 h-10 text-ink-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 15s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01" strokeLinecap="round" />
              </svg>
              <p className="text-ink-500 text-sm">آیتمی موجود نیست</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <MenuItemCard key={item.id} item={item} categoryId={activeCategory!} delay={Math.min(idx * 60, 360)} />
            ))
          )}
        </div>
      </main>

      {/* ═══ Footer ═══ */}
      {restaurant && (
        <footer className="border-t-2 border-ink-900/15">
          <div className="text-center py-6 px-5">
            <p className="text-ink-600 text-[11px] leading-6">{restaurant.address}</p>
            <div className="ink-line mt-4 mb-3 max-w-40 mx-auto" />
            <p className="text-ink-400 text-[9px] tracking-[0.15em] uppercase">Brunch Burger</p>
          </div>
        </footer>
      )}
    </div>
  );
}
