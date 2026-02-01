import { API_PATHS } from "./apiPaths.js";
import axiosInstance from "./axiosinstance";

const uploadImage = async (imageFile) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve({ imageUrl: reader.result });
        reader.onerror = (error) => reject(error);
    });
};

export default uploadImage;