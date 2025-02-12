import axios from 'axios';
import axiosInstance from '@/components/utils/axiosInstence';
export const handleAxiosErrorlogin = (error:any)=>{
    console.log(error)
    const errorMessage = error?.response?.data?.errorMessage || "Unexpected error occurred"
    console.log(errorMessage)
    return new Error(errorMessage)
  }


  export const adminloginApi = async (data: Record<string, any>) => {
    try {
        const response=await   axiosInstance.post(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/adminlogin`, data, { withCredentials: true })
       
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
  };

  export const getallappoinmentsApi = async () => {
    try {
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/appointments`, { withCredentials: true });
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const getalldoctorssApi = async () => {
    try {
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/verifieddoctors`, { withCredentials: true });
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const getallpatientsApi = async () => {
    try {
        const response = await  axiosInstance.get(`${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/patients`, { withCredentials: true });
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const getallverifydoctorssApi = async (data: Record<string, any>) => {
    try {
        const response = await   axiosInstance.patch(
            `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/doctors`,
            data,
            { withCredentials: true }
          );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const blockdoctorssApi = async (data: Record<string, any>) => {
    try {
        const response = await    axiosInstance.patch(
            `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/verifieddoctors`,
            data,
            { withCredentials: true }
          );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const getreviewsApi = async () => {
    try {
        const response = await axiosInstance.get(
                  `${process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL}/reviews`,
                  { withCredentials: true }
                );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}




