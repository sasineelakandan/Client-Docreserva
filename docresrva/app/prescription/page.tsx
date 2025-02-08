'use client';

import React, { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Swal from 'sweetalert2';
import * as yup from 'yup';
import axiosInstance from '@/components/utils/axiosInstence';
import { useRouter, useSearchParams } from 'next/navigation';
import DoctorNavbar from '@/components/utils/doctorNavbar';

// Define the prescription form data structure
type PrescriptionFormData = {
  patientName: string;
  medication: string;
  dosage: string;
  instructions: string;
  days: number;
  prescriptionDate: string;
};

const PrescriptionForm: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrescriptionFormContent />
    </Suspense>
  );
};

const PrescriptionFormContent: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormData>({
    resolver: yupResolver(
      yup.object().shape({
        patientName: yup.string().required('Patient name is required'),
        medication: yup.string().required('Medication is required'),
        dosage: yup.string().required('Dosage is required'),
        instructions: yup.string().required('Instructions are required'),
        days: yup.number().positive().integer().required('Number of days is required'),
        prescriptionDate: yup.string().required('Prescription date is required'),
      })
    ),
    defaultValues: {
      prescriptionDate: new Date().toISOString().split('T')[0],
    },
  });

  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id') || '';
  const router = useRouter();

  const onSubmit = async (data: PrescriptionFormData) => {
    try {
      const payload = { ...data, appointmentId };

      await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/prescriptions`,
        payload,
        { withCredentials: true }
      );

      Swal.fire({
        title: 'Success!',
        text: 'Prescription submitted successfully!',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
      });

      reset();
      router.push('/appointmentPage');
    } catch (error) {
      console.error('Error submitting prescription:', error);

      Swal.fire({
        title: 'Error!',
        text: 'Failed to submit prescription. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <>
      <DoctorNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-700 to-indigo-800 p-8">
        <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-10">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Prescription Form
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Mapping over form fields with explicit types */}
            {(['patientName', 'medication', 'dosage', 'instructions'] as (keyof PrescriptionFormData)[]).map(
              (field) => (
                <div key={field}>
                  <label className="block text-gray-700 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')}:
                  </label>
                  {field === 'instructions' ? (
                    <textarea
                      {...register(field)}
                      className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      {...register(field)}
                      className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  <p className="text-red-500 text-sm">{errors[field]?.message}</p>
                </div>
              )
            )}

            <div>
              <label className="block text-gray-700">How many days to take tablet:</label>
              <input
                type="number"
                {...register('days')}
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-red-500 text-sm">{errors.days?.message}</p>
            </div>

            <div>
              <label className="block text-gray-700">Prescription Date:</label>
              <input
                type="date"
                {...register('prescriptionDate')}
                className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-red-500 text-sm">{errors.prescriptionDate?.message}</p>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send Prescription
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PrescriptionForm;
