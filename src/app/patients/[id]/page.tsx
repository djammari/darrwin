'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid2 as Grid,
  Chip,
  Avatar,
  Divider,
  Alert,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Cake as CakeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { differenceInYears, differenceInMonths, format } from 'date-fns';

interface Patient {
  id: string;
  name: string;
  breed: string;
  birthDate: string;
  gender: 'male' | 'female';
  weight?: number;
  color?: string;
  microchipId?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  medicalNotes?: string;
  appointments?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    title: string;
    status: string;
  }>;
  sessions?: Array<{
    id: string;
    sessionDate: string;
    notes?: string;
    diagnosis?: string;
    treatment?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadPatient(params.id as string);
    }
  }, [params.id]);

  const loadPatient = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patients/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load patient');
      }
      
      const data = await response.json();
      setPatient(data);
      setError(null);
    } catch (err) {
      setError('Failed to load patient details');
      console.error('Error loading patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const years = differenceInYears(new Date(), birth);
    const months = differenceInMonths(new Date(), birth) % 12;
    
    if (years === 0) {
      return `${months} months old`;
    } else if (months === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'} old`;
    } else {
      return `${years}y ${months}m old`;
    }
  };

  const getPatientAvatar = (patient: Patient) => {
    const initial = patient.name.charAt(0).toUpperCase();
    const bgColor = patient.gender === 'male' ? '#1976d2' : '#d32f2f';
    return (
      <Avatar sx={{ bgcolor: bgColor, width: 80, height: 80, fontSize: '2rem' }}>
        {initial}
      </Avatar>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Skeleton variant="circular" width={80} height={80} />
                  <Box>
                    <Skeleton variant="text" width={150} height={32} />
                    <Skeleton variant="text" width={100} height={24} />
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Skeleton variant="text" width="100%" height={24} />
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={24} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error || !patient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/patients')}
          sx={{ mb: 3 }}
        >
          Back to Patients
        </Button>
        <Alert severity="error">
          {error || 'Patient not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/patients')}
        >
          Back to Patients
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
        >
          Edit Patient
        </Button>
      </Box>

      {/* Patient Info Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Left side - Avatar and basic info */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                {getPatientAvatar(patient)}
                <Box textAlign="center">
                  <Typography variant="h4" component="h1" gutterBottom>
                    {patient.name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {patient.breed}
                  </Typography>
                  <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap">
                    <Chip 
                      icon={patient.gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
                      label={patient.gender}
                      color={patient.gender === 'male' ? 'primary' : 'secondary'}
                    />
                    <Chip 
                      icon={<CakeIcon />}
                      label={calculateAge(patient.birthDate)}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right side - Detailed info */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h6" gutterBottom>
                Pet Information
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Birth Date</Typography>
                  <Typography variant="body1">
                    {format(new Date(patient.birthDate), 'MMMM d, yyyy')}
                  </Typography>
                </Grid>
                {patient.weight && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Weight</Typography>
                    <Typography variant="body1">{patient.weight} kg</Typography>
                  </Grid>
                )}
                {patient.color && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Color</Typography>
                    <Typography variant="body1">{patient.color}</Typography>
                  </Grid>
                )}
                {patient.microchipId && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Microchip ID</Typography>
                    <Typography variant="body1">{patient.microchipId}</Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Owner Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">Owner</Typography>
                  </Box>
                  <Typography variant="body1">{patient.ownerName}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">Phone</Typography>
                  </Box>
                  <Typography variant="body1">{patient.ownerPhone}</Typography>
                </Grid>
                {patient.ownerEmail && (
                  <Grid size={{ xs: 12 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                    </Box>
                    <Typography variant="body1">{patient.ownerEmail}</Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>

          {patient.medicalNotes && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                Medical Notes
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {patient.medicalNotes}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Appointments and Sessions */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Appointments
              </Typography>
              {patient.appointments && patient.appointments.length > 0 ? (
                patient.appointments.map((appointment) => (
                  <Box key={appointment.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {appointment.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(appointment.startTime), 'MMM d, yyyy - h:mm a')}
                    </Typography>
                    <Chip 
                      label={appointment.status} 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No appointments yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Sessions
              </Typography>
              {patient.sessions && patient.sessions.length > 0 ? (
                patient.sessions.map((session) => (
                  <Box key={session.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(session.sessionDate), 'MMM d, yyyy')}
                    </Typography>
                    {session.diagnosis && (
                      <Typography variant="body1" fontWeight="medium">
                        {session.diagnosis}
                      </Typography>
                    )}
                    {session.notes && (
                      <Typography variant="body2">
                        {session.notes}
                      </Typography>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No sessions yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
