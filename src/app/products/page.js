"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { getProducts, searchProducts } from "@/lib/products";

export default function ProductsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchQuery = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(searchQuery);

  const pageParam = parseInt(searchParams.get("page"), 10);
  const limitParam = parseInt(searchParams.get("limit"), 10);

  const validLimits = [10, 20, 50];
  const limit = validLimits.includes(limitParam) ? limitParam : 10;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const page =
    Number.isInteger(pageParam) && pageParam >= 1 && pageParam <= totalPages
      ? pageParam
      : 1;

  const skip = (page - 1) * limit;

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateParams({ search: searchInput, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = searchQuery
          ? await searchProducts({
              query: searchQuery,
              limit,
              skip,
              signal: controller.signal,
            })
          : await getProducts({ limit, skip, signal: controller.signal });

        setProducts(data.products);
        setTotal(data.total);
      } catch (err) {
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
          return;
        }
        setError("Failed to load products.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, [searchQuery, limit, skip]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateParams({ page: newPage });
  };

  const handleLimitChange = (e) => {
    updateParams({ limit: e.target.value, page: 1 });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleRetry = () => {
    setError(null);
    updateParams({ page });
  };

  const startItem = total === 0 ? 0 : skip + 1;
  const endItem = Math.min(skip + limit, total);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Welcome, {user?.username}</h1>
          <button
            onClick={handleLogout}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full max-w-md rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading && (
          <p className="text-center text-gray-500">Loading products...</p>
        )}

        {!isLoading && error && (
          <div className="text-center">
            <p className="mb-2 text-red-600">{error}</p>
            <button
              onClick={handleRetry}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <p className="text-center text-gray-500">
            No products found{searchQuery ? ` for "${searchQuery}"` : ""}.
          </p>
        )}

        {!isLoading && !error && products.length > 0 && (
          <>
            <table className="hidden w-full border-collapse md:table">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="py-2">Image</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Rating</th>
                  <th className="py-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b text-sm">
                    <td className="py-2">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    </td>
                    <td className="py-2">{product.title}</td>
                    <td className="py-2">{product.category}</td>
                    <td className="py-2">${product.price}</td>
                    <td className="py-2">{product.rating}</td>
                    <td className="py-2">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex flex-col gap-3 md:hidden">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3 rounded border p-3 shadow-sm"
                >
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-16 w-16 rounded object-cover"
                  />
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{product.title}</span>
                    <span className="text-gray-500">{product.category}</span>
                    <span>${product.price}</span>
                    <span>Rating: {product.rating}</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Showing {startItem}–{endItem} of {total}
                </span>
                <select
                  value={limit}
                  onChange={handleLimitChange}
                  className="rounded border border-gray-300 px-2 py-1"
                >
                  {validLimits.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
                  )
                  .map((p, index, arr) => (
                    <span key={p} className="flex items-center">
                      {index > 0 && arr[index - 1] !== p - 1 && (
                        <span className="px-1 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(p)}
                        className={`rounded border px-3 py-1 text-sm ${
                          p === page
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}