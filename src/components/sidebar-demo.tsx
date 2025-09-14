"use client";
import React, { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconCategory,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string };
type Product = { id: string; name: string; slug: string; images: string[]; description?: string; variants: { price: number }[] };

export default function SidebarDemo() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
      if ((data.categories || []).length > 0) {
        setSelected(data.categories[0].id);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      // fetch products and filter client-side by categoryId (requires categoryId on product in API if needed)
      const res = await fetch("/api/products?limit=200");
      const data = await res.json();
      const list: any[] = data.data || [];
      setProducts(list.filter((p) => p.categoryId === selected));
    })();
  }, [selected]);

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-[60vh]",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={cn("flex items-center gap-2 py-2", selected === c.id && "text-blue-600")}
                >
                  <IconCategory className="h-5 w-5 shrink-0" />
                  <span className="text-sm">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard products={products} />
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Categories
      </motion.span>
    </a>
  );
};

// Dummy product grid that shows products of selected category
const Dashboard = ({ products }: { products: Product[] }) => {
  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-4 rounded-tl-2xl border border-neutral-200 bg-white p-4 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        {products.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-300">No products in this category.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 bg-gray-50 dark:bg-neutral-800">
                <div className="aspect-video bg-gray-200 dark:bg-neutral-700 rounded mb-2" />
                <div className="font-medium line-clamp-1">{p.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


