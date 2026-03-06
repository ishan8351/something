import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    withCredentials: true
});

export const productApi = {
    getProducts: async ({ page = 1, limit = 12, query = '', categoryId = '' } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (query) params.append('query', query);
        if (categoryId && categoryId !== 'All') params.append('categoryId', categoryId);

        const response = await api.get(`/products?${params.toString()}`);
        return response.data.data;
    },

    getProductById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data.data;
    },

    getCategories: async () => {
        const response = await api.get('/categories');
        return response.data.data;
    }
};
