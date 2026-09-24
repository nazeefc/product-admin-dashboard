import axiosInstance from "./axios";

export const getProducts = async ({ limit, skip, sortBy, order, signal }) => {
  const params = { limit, skip };

  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || "asc";
  }

  const response = await axiosInstance.get("/products", { params, signal });
  return response.data;
};

export const searchProducts = async ({ query, limit, skip, signal }) => {
  const response = await axiosInstance.get("/products/search", {
    params: { q: query, limit, skip },
    signal,
  });
  return response.data;
};

export const getProductsByCategory = async ({ category, limit, skip }) => {
  const response = await axiosInstance.get(`/products/category/${category}`, {
    params: { limit, skip },
  });
  return response.data;
};

export const getCategories = async () => {
  const response = await axiosInstance.get("/products/categories");
  return response.data;
};

export const getProductById = async (id, config = {}) => {
  const response = await axiosInstance.get(`/products/${id}`, config);
  return response.data;
};

export const addProduct = async (productData) => {
  const response = await axiosInstance.post("/products/add", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axiosInstance.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};