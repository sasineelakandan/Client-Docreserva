import axios from 'axios';
import axiosInstance from '@/components/utils/axiosInstence';
export const handleAxiosErrorlogin = (error:any)=>{
    console.log(error)
    const errorMessage = error?.response?.data?.errorMessage || "Unexpected error occurred"
    console.log(errorMessage)
    return new Error(errorMessage)
  }


  export const doctorsignupApi = async (fullData: Record<string, any>) => {
    try {
        
        const response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/signup`,
                fullData,
                { withCredentials: true }
              );
       
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
  };

  export const doctorloginApi = async (data: Record<string, any>) => {
    try {
        const response=await  axiosInstance.post(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/login`, data, {
            withCredentials: true,
          });
       
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
  };

  export const doctorotpApi = async (data: Record<string, any>) => {
    try {
        const response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/verifyotp`,
                data,
                { withCredentials: true }
              );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const doctorresendOtpApi = async (data: Record<string, any>) => {
    try {
        const response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/resendotp`,
                data,
                { withCredentials: true }
              );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const createslotApi = async (data: Record<string, any>) => {
    try {
        const response = await  axiosInstance.post(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/createslots`, data, {
              headers: { 'Content-Type': 'application/json' },
              withCredentials: true,
            });
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const getdoctorProfileApi = async () => {
    try {
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/profile`, { withCredentials: true });
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const uploadpicApi = async (data: Record<string, any>) => {
    try {
        const response = await  axiosInstance.post(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/profile`, data, {
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
}

export const doctorchangeprofileApi = async (data: Record<string, any>) => {
    try {
        const response =await axiosInstance.put(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/profile`,
            data,
            { withCredentials: true }
          );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
  };

  export const doctorpasswordChangeApi = async (data: Record<string, any>) => {
    try {
        let response=await axiosInstance.patch(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/profile`,
                data,
                { withCredentials: true }
              );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const veryfydoctorApi = async (data: Record<string, any>) => {
    try {
         const response = await axiosInstance.post(
            `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/verifyprofile`,
            data,
            { withCredentials: true }
          );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const updateslotApi = async (data: Record<string, any>) => {
    try {
         const response = await axiosInstance.put(
                 `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/createslots`,
                 data,
                 {
                   headers: { 'Content-Type': 'application/json' },
                   withCredentials: true,
                 }
               );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const blockslotApi = async (data: Record<string, any>) => {
    try {
         const response = await axiosInstance.patch(
            `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/createslots`,
            data, // Sending as an object
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}

export const forgotpasswordApi = async (data: Record<string, any>) => {
    try {
         const response = await axiosInstance.post(
                 `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/forgotpassword`,
                 data,
                 { withCredentials: true }
               );
      return response;
    } catch (error: any) {
      console.log(error,"from api")
      throw error; 
    }
}


export const forgototpApi = async (data: Record<string, any>) => {
  try {
       const response = await axiosInstance.put(
               `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/forgotpassword`,
               data,
               { withCredentials: true }
             );
    return response;
  } catch (error: any) {
    console.log(error,"from api")
    throw error; 
  }


}

export const getdashbordApi = async () => {
  try {
      const response = await axiosInstance.get<any[]>(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/dashbord`,
        { withCredentials: true }
      )
    return response;
  } catch (error: any) {
    console.log(error,"from api")
    throw error; 
  }
}

export const getappointmetApi = async () => {
  try {
      const response = await axios.get<any[]>(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/appointments`,
        { withCredentials: true }
      );
    return response;
  } catch (error: any) {
    console.log(error,"from api")
    throw error; 
  }
}


export const statusApi = async (data: Record<string, any>) => {
  try {
       const response = await axiosInstance.patch(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/appointments`,
        data,
        { withCredentials: true }
      );
    return response;
  } catch (error: any) {
    console.log(error,"from api")
    throw error; 
  }


}
