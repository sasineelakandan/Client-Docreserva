'use client'

import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, Chip, TablePagination, TextField 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DoctorNavbar from '@/components/utils/doctorNavbar';
import axiosInstance from '@/components/utils/axiosInstence';

interface Prescription {
  _id: string;
  doctorId: string;
  patientName: string;
  medication: string;
  dosage: string;
  instructions: string;
  appointmentId: string;
  createdByDoctor: boolean;
  createdAt: string;
}

const StyledTableContainer = styled(TableContainer)({
  maxWidth: '90%',
  margin: '20px auto',
  borderRadius: '10px',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
});

const HeaderTypography = styled(Typography)({
  textAlign: 'center',
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: '10px',
  color: '#1976d2',
});

const PrescriptionHistory: React.FC = () => {
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptionsData, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_DOCTOR_BACKEND_URL}/prescriptions`, {
          withCredentials: true,
        });
        setPrescriptions(response.data);
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
      }
    };
    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptionsData.filter(prescription => 
    prescription.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedPrescriptions = filteredPrescriptions.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <>
      <DoctorNavbar />
      <Paper elevation={3} sx={{ borderRadius: '10px', maxWidth: '90%', margin: '20px auto', padding: '10px' }}>
        <HeaderTypography>Prescription History</HeaderTypography>
        <TextField
          label="Search by Patient Name"
          variant="outlined"
          fullWidth
          sx={{ marginBottom: '10px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell><strong>Patient Name</strong></TableCell>
                <TableCell><strong>Medication</strong></TableCell>
                <TableCell><strong>Dosage</strong></TableCell>
                <TableCell><strong>Instructions</strong></TableCell>
                <TableCell><strong>Created By</strong></TableCell>
                <TableCell><strong>Created At</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedPrescriptions.map((prescription) => (
                <TableRow key={prescription?._id}>
                  <TableCell>{prescription?.patientName}</TableCell>
                  <TableCell>{prescription?.medication}</TableCell>
                  <TableCell>{prescription?.dosage}</TableCell>
                  <TableCell>{prescription?.instructions}</TableCell>
                  <TableCell>
                    <Chip
                      label={prescription?.createdByDoctor ? 'Doctor' : 'System'}
                      color={prescription?.createdByDoctor ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>{new Date(prescription.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>

        <TablePagination
          component="div"
          count={filteredPrescriptions.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPageOptions={[]}
        />
      </Paper>
    </>
  );
};

export default PrescriptionHistory;
