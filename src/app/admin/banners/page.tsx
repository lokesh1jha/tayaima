"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";
import { LoadingPage } from "@/components/ui/LoadingSpinner";

interface Banner {
  id: string;
  imageUrl: string;
  title?: string | null;
  description?: string | null;
  link?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", "ad-banner"); // Store banners in ad-banner/ directory

      const res = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = data.urls[0];
        setImageUrl(uploadedUrl);
        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl) {
      toast.error("Please upload an image");
      return;
    }

    try {
      const payload = {
        imageUrl,
        title: title || null,
        description: description || null,
        link: link || null,
        sortOrder,
        isActive,
      };

      const res = editingBanner
        ? await fetch(`/api/admin/banners/${editingBanner.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/banners", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (res.ok) {
        toast.success(editingBanner ? "Banner updated" : "Banner created");
        resetForm();
        setShowAddForm(false);
        setEditingBanner(null);
        fetchBanners();
      } else {
        toast.error("Failed to save banner");
      }
    } catch (error) {
      console.error("Error saving banner:", error);
      toast.error("Error saving banner");
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setImageUrl(banner.imageUrl);
    setTitle(banner.title || "");
    setDescription(banner.description || "");
    setLink(banner.link || "");
    setSortOrder(banner.sortOrder);
    setIsActive(banner.isActive);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Banner deleted");
        fetchBanners();
      } else {
        toast.error("Failed to delete banner");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Error deleting banner");
    }
  };

  const resetForm = () => {
    setImageUrl("");
    setTitle("");
    setDescription("");
    setLink("");
    setSortOrder(0);
    setIsActive(true);
  };

  if (loading) {
    return <LoadingPage message="Loading banners..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Banners
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage homepage banner carousel
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          Add Banner
        </Button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-800">
              <Image
                src={banner.imageUrl}
                alt={banner.title || "Banner"}
                fill
                className="object-cover"
              />
              {!banner.isActive && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold">Inactive</span>
                </div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {banner.title || "Untitled Banner"}
                  </h3>
                  {banner.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {banner.description}
                    </p>
                  )}
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  Order: {banner.sortOrder}
                </span>
              </div>
              
              {banner.link && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Link: {banner.link}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleEdit(banner)}
                >
                  Edit
                </Button>
                <Button
                  variant="error"
                  className="flex-1"
                  onClick={() => handleDelete(banner.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {banners.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No banners yet. Create your first banner to get started.
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingBanner(null);
          resetForm();
        }}
        title={editingBanner ? "Edit Banner" : "Add New Banner"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Banner Image *
            </label>
            {imageUrl ? (
              <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="w-full"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title (optional)
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Banner title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Banner description"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
              rows={3}
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Link (optional)
            </label>
            <Input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Sort Order
            </label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={0}
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active (show on homepage)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowAddForm(false);
                setEditingBanner(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!imageUrl || uploading}>
              {editingBanner ? "Update" : "Create"} Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

