"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getProductById } from "@/lib/products";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
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
        } else {
          setError("Failed to load product.");
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
          <p className="mb-4 text-gray-500">
            No product exists with id &quot;{id}&quot;.
          </p>
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

  if (error) {
    return (
      <ProtectedRoute>
        <div className="p-6 text-center">
          <p className="mb-2 text-red-600">{error}</p>
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
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/products")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Products
          </button>
          <button
            onClick={() => router.push(`/products/${id}/edit`)}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Edit Product
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <img
              src={
                product.thumbnail ||
                "https://via.placeholder.com/400?text=No+Image"
              }
              alt={product.title}
              className="mb-3 h-64 w-full rounded object-cover"
            />
            <div className="flex gap-2 overflow-x-auto">
              {product.images?.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.title} ${index + 1}`}
                  className="h-16 w-16 flex-shrink-0 rounded object-cover"
                />
              ))}
            </div>
          </div>

          <div>
            <h1 className="mb-2 text-2xl font-semibold">{product.title}</h1>
            <p className="mb-1 text-sm text-gray-500">{product.category}</p>
            <p className="mb-3 text-xl font-bold text-gray-800">
              ${product.price}
            </p>
            <p className="mb-4 text-gray-600">{product.description}</p>
            <p className="mb-1 text-sm">Rating: {product.rating}</p>
            <p className="text-sm">Stock: {product.stock}</p>
          </div>
        </div>

        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">Reviews</h2>
            <div className="flex flex-col gap-3">
              {product.reviews.map((review, index) => (
                <div key={index} className="rounded border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{review.reviewerName}</span>
                    <span className="text-gray-500">
                      Rating: {review.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}