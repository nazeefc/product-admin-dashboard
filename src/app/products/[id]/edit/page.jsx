"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProductForm from "@/components/ProductForm";
import { getProductById, updateProduct } from "@/lib/products";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setIsLoading(true);
      setNotFound(false);

      if (typeof window !== "undefined") {
        const sessionProducts = JSON.parse(
          sessionStorage.getItem("addedProducts") || "[]"
        );
        const sessionMatch = sessionProducts.find(
          (p) => String(p.id) === String(id)
        );

        if (sessionMatch) {
          setProduct(sessionMatch);
          setIsLoading(false);
          return;
        }
      }

      try {
        const data = await getProductById(id, { signal: controller.signal });
        setProduct(data);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return;
        }

        if (err.response && err.response.status === 404) {
          setNotFound(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [id]);

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await updateProduct(id, formData);

      if (typeof window !== "undefined") {
        const sessionProducts = JSON.parse(
          sessionStorage.getItem("addedProducts") || "[]"
        );

        const existsInSession = sessionProducts.some(
          (p) => String(p.id) === String(id)
        );

        let updatedSessionProducts;

        if (existsInSession) {
          updatedSessionProducts = sessionProducts.map((p) =>
            String(p.id) === String(id) ? { ...p, ...updated, id: p.id } : p
          );
        } else {
          updatedSessionProducts = [
            { ...updated, id },
            ...sessionProducts,
          ];
        }

        sessionStorage.setItem(
          "editedOrAddedProducts",
          "true"
        );
        sessionStorage.setItem(
          "addedProducts",
          JSON.stringify(updatedSessionProducts)
        );
      }

      router.push(`/products/${id}`);
    } catch (err) {
      setError("Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <p className="p-6 text-center text-gray-500">Loading product...</p>
      </ProtectedRoute>
    );
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-gray-800">
            Product not found
          </h1>
          <button
            onClick={() => router.push("/products")}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 text-xl font-semibold">Edit Product</h1>

        {error && (
          <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <ProductForm
          initialData={{
            title: product.title || "",
            category: product.category || "",
            price: product.price ?? "",
            stock: product.stock ?? "",
            rating: product.rating ?? "",
            description: product.description || "",
          }}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
          submitLabel="Save Changes"
        />
      </div>
    </ProtectedRoute>
  );
}