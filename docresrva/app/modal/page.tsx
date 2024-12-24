'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaCamera } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

interface DoctorModalProps {
  isOpen: boolean;
  userId?: string;
  onClose: () => void;
}

const schema = yup.object({
  hospitalName: yup.string().required('Hospital name is required'),
  licenseNumber: yup.string().required('License number is required'),

  licenseImage: yup.string().required('License image URL is required'),
  licenseImage1: yup.string().required('Profile image URL is required'),
  fees: yup
    .number()
    .required('Fees are required')
    .positive('Fees must be a positive number')
    .typeError('Fees must be a valid number'),
}).required();

const DoctorModal: React.FC<any> = ({ isOpen, onClose, userId }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      hospitalName: '',
      licenseNumber: '',
      
      licenseImage: '',
      licenseImage1: '',
      fees: 0,
    },
  });

  useEffect(() => {
    if (userId) {
      console.log("Modal opened for user:", userId);
    }
  }, [userId]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef1 = useRef<HTMLInputElement | null>(null);
  const [previewImage1, setPreviewImage1] = useState<string | null>(null);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleConfirmUpload = async () => {
    if (!previewImage) {
      toast.error('No image selected!');
      return;
    }

    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        toast.error('Please select a file!');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<{ url: string }>(
        '/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const imageUrl = response.data.url;
      setValue('licenseImage', imageUrl);
      toast.success('Image uploaded successfully!');
      setPreviewImage(null); 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(`Upload failed: ${error.response?.data || error.message}`);
      } else {
        toast.error('Upload failed due to an unknown error.');
      }
    }
  };

  const handleCameraClick1 = () => {
    fileInputRef1.current?.click();
  };

  const handleFileSelection1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage1(URL.createObjectURL(file));
    }
  };

  const handleConfirmUpload1 = async () => {
    if (!previewImage1) {
      toast.error('No image selected!');
      return;
    }

    try {
      const file = fileInputRef1.current?.files?.[0];
      if (!file) {
        toast.error('Please select a file!');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<{ url: string }>(
        '/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const imageUrl1 = response.data .url;
      localStorage.setItem("profilePic", response.data.url);
      setValue('licenseImage1', imageUrl1);
      toast.success('Image uploaded successfully!');
      setPreviewImage1(null); // Clear preview after upload
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(`Upload failed: ${error.response?.data || error.message}`);
      } else {
        toast.error('Upload failed due to an unknown error.');
      }
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post(
        'http://localhost:8001/api/doctor/verifyprofile',
        data,
        { withCredentials: true }
      );
      if (response.data) {
        toast.success('Doctor details submitted successfully!');
        window.location.reload()
      }
    } catch (error) {
      toast.error('Failed to submit doctor details.');
    }
    onClose();
  };

  if (!isOpen) return null;

  const licenseImage = watch('licenseImage');
  const licenseImage1 = watch('licenseImage1');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 overflow-y-auto max-h-[80vh]">
        <h2 className="text-xl font-bold mb-4">Doctor Details</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
            <Controller
              name="hospitalName"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  className={`mt-1 p-2 w-full border ${
                    errors.hospitalName ? 'border-red-500' : 'border-gray-300'
                  } rounded-md`}
                />
              )}
            />
            {errors.hospitalName && (
              <p className="text-red-500 text-sm">{errors.hospitalName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <Controller
              name="licenseNumber"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  className={`mt-1 p-2 w-full border ${
                    errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                  } rounded-md`}
                />
              )}
            />
            {errors.licenseNumber && (
              <p className="text-red-500 text-sm">{errors.licenseNumber.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Fees</label>
            <Controller
              name="fees"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  {...field}
                  className={`mt-1 p-2 w-full border ${
                    errors.fees ? 'border-red-500' : 'border-gray-300'
                  } rounded-md`}
                />
              )}
            />
            {errors.fees && (
              <p className="text-red-500 text-sm">{errors.fees.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Image</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelection}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleCameraClick}
              className="mt-2 p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600"
            >
              <FaCamera className="w-6 h-6" />
            </button>
            {previewImage && (
              <div className="mt-4">
                <img src={previewImage} alt="Preview" className="w-full rounded-md" />
                <div className="flex mt-2">
                  <button
                    type="button"
                    onClick={handleConfirmUpload}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2"
                  >
                    Confirm Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null); // Clear the preview image
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''; // Reset the file input only if it's not null
                      }// Reset the file input
                    }}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            {licenseImage && (
              <p className="text-gray-700 mt-2 text-sm">Uploaded: {licenseImage}</p>
            )}
            {errors.licenseImage && (
              <p className="text-red-500 text-sm">{errors.licenseImage.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Image</label>
            <input
              type="file"
              ref={fileInputRef1}
              onChange={handleFileSelection1}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleCameraClick1}
              className="mt-2 p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600"
            >
              <FaCamera className="w-6 h-6" />
            </button>
            {previewImage1 && (
              <div className="mt-4">
                <img src={previewImage1} alt="Preview" className="w-full rounded-md" />
                <div className="flex mt-2">
                  <button
                    type="button"
                    onClick={handleConfirmUpload1}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2"
                  >
                    Confirm Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage1(null); // Clear the preview image
                      if (fileInputRef1.current) {
                        fileInputRef1.current.value = ''; // Reset the file input only if it's not null
                      }
                    }}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            {licenseImage1 && (
              <p className="text-gray-700 mt-2 text-sm">Uploaded: {licenseImage1}</p>
            )}
            {errors.licenseImage1 && (
              <p className="text-red-500 text-sm">{errors.licenseImage1.message}</p>
            )}
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorModal;