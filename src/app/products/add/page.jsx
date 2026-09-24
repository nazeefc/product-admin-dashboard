"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProductForm from "@/components/ProductForm";
import { addProduct } from "@/lib/products";

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAdd = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newProduct = await addProduct(formData);

      if (typeof window !== "undefined") {
        const sessionProducts = JSON.parse(
          sessionStorage.getItem("addedProducts") || "[]"
        );
        sessionStorage.setItem(
          "addedProducts",
          JSON.stringify([newProduct, ...sessionProducts])
        );
      }

      router.push("/products");
    } catch (err) {
      setError("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 text-xl font-semibold">Add Product</h1>

        {error && (
          <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <ProductForm
          onSubmit={handleAdd}
          isSubmitting={isSubmitting}
          submitLabel="Add Product"
        />
      </div>
    </ProtectedRoute>
  );
}