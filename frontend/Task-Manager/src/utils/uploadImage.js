import { API_PATHS } from "./apiPaths.js";
import axiosInstance from "./axiosinstance";

const uploadImage = async (imageFile) =>{
    const formData = new FormData();
    // Append image file file to form data
    formData.append('image',imageFile);
    try{
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE,formData,{
            headers:{
                'Content-Type':'multipart/form-data',//Set Header for file uplaod
            },
        });
        return response.data; //Returns response data
    }catch(error){
        console.error('Error uploading the image:',error);
        throw error; //Rethrew error for handling
    };
};
export default uploadImage;