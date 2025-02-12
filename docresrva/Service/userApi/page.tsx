import axios from 'axios';
import axiosInstance from '@/components/utils/axiosInstence';
export const handleAxiosErrorlogin = (error:any)=>{
    console.log(error)
    const errorMessage = error?.response?.data?.errorMessage || "Unexpected error occurred"
    console.log(errorMessage)
    return new Error(errorMessage)
  }

  
;
export const signupApi = async (data: Record<string, any>) => {
    try {
        console.log(data)
        const response = await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/signup`,
            data,
            { withCredentials: true }
        )
       
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
  };

  export const loginApi = async (data: Record<string, any>) => {
    try {
        const response=await axios.post(
            `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/login`,
            data,
            { withCredentials: true }
          );
       
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
  };

  export const profileApi = async () => {
    try {
        const response=await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/profile`,
            
            { withCredentials: true }
          );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
  };

  export const profilepicApi = async (formData: Record<string, any>) => {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/profile`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true, // Enables sending cookies and authentication headers
          });
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
  };

  export const PasswordChangeApi = async (data: Record<string, any>) => {
    try {
        let response=await axiosInstance.put(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/profile`,
            data,
            { withCredentials: true }
          );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}


export const ProfileChangeApi = async (data: Record<string, any>) => {
    try {
        let response=await axiosInstance.patch(`${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/profile`,
            data,
            { withCredentials: true }
          );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const otpApi = async (data: Record<string, any>) => {
    try {
        const response = await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/verifyotp`,
            data,
            { withCredentials: true }
          );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const resendotpApi = async (data: Record<string, any>) => {
    try {
      const response= await axiosInstance.post(
               `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/resendotp`,
               data,
               { withCredentials: true }
             );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const getdoctorApi = async () => {
    try {
      const response= axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/getdoctors`,
        { withCredentials: true }
      );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}


export const getdoctorDetail = async (data: Record<string, any>) => {
    try {
      const response= axiosInstance.patch(
        `${process.env.NEXT_PUBLIC_BOOKING_BACKEND_URL}/getdoctors`,
        data,
        { withCredentials: true }
      );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const slotApi = async (data: Record<string, any>) => {
    try {
      const response= await axiosInstance.post(
              `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/createslots`,
              data,
              { withCredentials: true }
            );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const getappoinmetApi = async () => {
    try {
      const response= await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/appointments`,

        { withCredentials: true }
      );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const cancelappoinmentApi = async (data: Record<string, any>) => {
    try {
      const response= await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_USER_BACKEND_URL}/appointments`,
        data,
        { withCredentials: true }
      );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}