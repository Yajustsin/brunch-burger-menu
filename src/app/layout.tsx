import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.brunchburger.ir"),
  title: "برانچ برگر | منوی آنلاین برگر، پیتزا و فست‌فود",
  description:
    "منوی آنلاین برانچ برگر در چهارراه ولیعصر تهران؛ مشاهده قیمت و ترکیبات انواع برگر، پیتزا، ساندویچ، پاستا و پیش‌غذا.",
  alternates: {
    canonical: "https://www.brunchburger.ir/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "برانچ برگر | منوی آنلاین برگر، پیتزا و فست‌فود",
    description:
      "منوی آنلاین برانچ برگر در چهارراه ولیعصر تهران؛ مشاهده قیمت و ترکیبات انواع برگر، پیتزا، ساندویچ، پاستا و پیش‌غذا.",
    url: "https://www.brunchburger.ir/",
    siteName: "برانچ برگر",
    locale: "fa_IR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.brunchburger.ir/#website",
      "name": "برانچ برگر",
      "alternateName": "Brunch Burger",
      "url": "https://www.brunchburger.ir/"
    },
    {
      "@type": "Restaurant",
      "@id": "https://www.brunchburger.ir/#restaurant",
      "name": "برانچ برگر",
      "alternateName": "Brunch Burger",
      "url": "https://www.brunchburger.ir/",
      "telephone": "+989330181415",
      "servesCuisine": [
        "برگر",
        "پیتزا",
        "ساندویچ",
        "پاستا",
        "فست‌فود"
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "چهارراه ولیعصر، خیابان انقلاب، ابتدای برادران مظفر جنوبی، پلاک ۶۵",
        "addressLocality": "تهران",
        "addressCountry": "IR"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-ink-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
