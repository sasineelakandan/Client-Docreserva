'use client'

import React, { useState } from "react";

type Patient = {
  id: number;
  name: string;
  age: number;
  condition: string;
  isBlocked: boolean; 
};

type EditModalProps = {
  patient: Patient;
  onClose: () => void;
  onUpdate: (updatedPatient: any) => any;
};

const EditModal: React.FC<EditModalProps> = ({ patient, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<Patient>({ ...patient });
  const [errors, setErrors] = useState<{ name?: string; age?: string; condition?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "age" ? Number(value) : value, // Convert age to number
    }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "Name cannot be empty.";
    if (!formData.age || formData.age <= 0) newErrors.age = "Age must be a positive number.";
    if (!formData.condition.trim()) newErrors.condition = "Condition cannot be empty.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (validate()) {
      onUpdate(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Patient</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold" htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`border p-2 w-full rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold" htmlFor="age">Age:</label>
            <input
              id="age"
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className={`border p-2 w-full rounded ${errors.age ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold" htmlFor="condition">Condition:</label>
            <input
              id="condition"
              type="text"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className={`border p-2 w-full rounded ${errors.condition ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
