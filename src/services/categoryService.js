import axios from 'axios';
import { getAuthSession } from "@/utils/auth";

//const API_URL = 'http://localhost:8000';
const API_URL = 'https://los-toneles.azurewebsites.net';

//traer todas las categorías
export const getAllCategories = async () => {
    try {
        const session = await getAuthSession();
        const res = await axios.get(`${API_URL}/categorias`, session);
        return res.data;
    } catch (error) {
        
        throw new Error('Failed to fetch categorias');
    }
};

export const getAllCategoriesSlugs = async () => {
    try {
        const res = await axios.get(`${API_URL}/category/slugs`);
        return res.data;
    } catch (error) {
        
        throw new Error('Failed to fetch categorias');
    }
};

const Services = {
    getAllCategories,
    getAllCategoriesSlugs,
};

export default Services;