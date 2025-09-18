'use client';

import { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Pets as PetsIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Cake as CakeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, differenceInYears, differenceInMonths } from 'date-fns';

// Patient type definition
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
  createdAt: string;
  updatedAt: string;
}

// Form validation schema
const patientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  breed: z.string().min(1, 'Breed is required').max(50, 'Breed too long'),
  birthDate: z.date({ required_error: 'Birth date is required' }),
  gender: z.enum(['male', 'female'], { required_error: 'Gender is required' }),
  weight: z.number().min(0.1, 'Weight must be positive').max(200, 'Weight too high').optional(),
  color: z.string().max(30, 'Color description too long').optional(),
  microchipId: z.string().max(20, 'Microchip ID too long').optional(),
  ownerName: z.string().min(1, 'Owner name is required').max(100, 'Owner name too long'),
  ownerPhone: z.string().min(10, 'Phone number required').max(20, 'Phone number too long'),
  ownerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  medicalNotes: z.string().max(500, 'Medical notes too long').optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      breed: '',
      gender: 'male',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: '',
      medicalNotes: '',
    }
  });

  // Load patients on component mount
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/patients');
      if (!response.ok) {
        throw new Error('Failed to load patients');
      }
      const data = await response.json();
      setPatients(data);
      setError(null);
    } catch (err) {
      setError('Failed to load patients. Using demo data for now.');
      // For now, use demo data until we set up the backend
      setPatients([
        {
          id: '1',
          name: 'Buddy',
          breed: 'Golden Retriever',
          birthDate: '2020-03-15',
          gender: 'male',
          weight: 32,
          color: 'Golden',
          ownerName: 'John Smith',
          ownerPhone: '+1-555-0123',
          ownerEmail: 'john@example.com',
          medicalNotes: 'Friendly dog, loves treats',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          name: 'Luna',
          breed: 'Persian Cat',
          birthDate: '2019-07-22',
          gender: 'female',
          weight: 4.5,
          color: 'White',
          ownerName: 'Sarah Johnson',
          ownerPhone: '+1-555-0456',
          ownerEmail: 'sarah@example.com',
          medicalNotes: 'Shy around strangers',
          createdAt: '2024-01-10T14:30:00Z',
          updatedAt: '2024-01-10T14:30:00Z',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      setSubmitting(true);
      
      const patientData = {
        ...data,
        birthDate: data.birthDate.toISOString(),
        weight: data.weight || undefined,
        ownerEmail: data.ownerEmail || undefined,
      };

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        throw new Error('Failed to create patient');
      }

      const newPatient = await response.json();
      setPatients(prev => [newPatient, ...prev]);
      setDialogOpen(false);
      reset();
      setError(null);
    } catch (err) {
      // For demo purposes, add to local state
      const newPatient: Patient = {
        id: Date.now().toString(),
        ...data,
        birthDate: data.birthDate.toISOString(),
        weight: data.weight || undefined,
        ownerEmail: data.ownerEmail || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPatients(prev => [newPatient, ...prev]);
      setDialogOpen(false);
      reset();
      setError('Patient added locally (backend not connected yet)');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const years = differenceInYears(new Date(), birth);
    const months = differenceInMonths(new Date(), birth) % 12;
    
    if (years === 0) {
      return `${months} months`;
    } else if (months === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      return `${years}y ${months}m`;
    }
  };

  const getPatientAvatar = (patient: Patient) => {
    const initial = patient.name.charAt(0).toUpperCase();
    const bgColor = patient.gender === 'male' ? '#1976d2' : '#d32f2f';
    return (
      <Avatar sx={{ bgcolor: bgColor, width: 56, height: 56 }}>
        {initial}
      </Avatar>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🐾 Patient Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your veterinary patients and their information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          size="large"
        >
          New Patient
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PetsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4">{patients.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MaleIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
              <Typography variant="h4">
                {patients.filter(p => p.gender === 'male').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Male Patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <FemaleIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4">
                {patients.filter(p => p.gender === 'female').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Female Patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Patient List */}
      <Typography variant="h5" gutterBottom>
        Patients
      </Typography>
      
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((n) => (
            <Grid key={n} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Skeleton variant="circular" width={56} height={56} />
                    <Box flex={1}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {patients.map((patient) => (
            <Grid key={patient.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { 
                    boxShadow: 3, 
                    transform: 'translateY(-2px)' 
                  } 
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                    {getPatientAvatar(patient)}
                    <Box flex={1}>
                      <Typography variant="h6" component="h3">
                        {patient.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {patient.breed}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <Chip 
                          icon={patient.gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
                          label={patient.gender}
                          size="small"
                          color={patient.gender === 'male' ? 'primary' : 'secondary'}
                        />
                        <Chip 
                          icon={<CakeIcon />}
                          label={calculateAge(patient.birthDate)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Owner:</strong> {patient.ownerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Phone:</strong> {patient.ownerPhone}
                    </Typography>
                    {patient.weight && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Weight:</strong> {patient.weight} kg
                      </Typography>
                    )}
                  </Box>

                  <Box display="flex" justifyContent="flex-end" gap={1}>
                    <IconButton size="small" color="primary">
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small" color="secondary">
                      <EditIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {patients.length === 0 && !loading && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <PetsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No patients yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Get started by adding your first patient
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Add First Patient
            </Button>
          </CardContent>
        </Card>
      )}

      {/* New Patient Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            Add New Patient
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Pet Information */}
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  Pet Information
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Pet Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="breed"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Breed"
                      fullWidth
                      error={!!errors.breed}
                      helperText={errors.breed?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Birth Date"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.birthDate,
                          helperText: errors.birthDate?.message,
                          required: true,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.gender} required>
                      <InputLabel>Gender</InputLabel>
                      <Select {...field} label="Gender">
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="weight"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <TextField
                      {...field}
                      label="Weight (kg)"
                      type="number"
                      fullWidth
                      value={value || ''}
                      onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      error={!!errors.weight}
                      helperText={errors.weight?.message}
                      inputProps={{ step: 0.1, min: 0 }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Color"
                      fullWidth
                      error={!!errors.color}
                      helperText={errors.color?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="microchipId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Microchip ID"
                      fullWidth
                      error={!!errors.microchipId}
                      helperText={errors.microchipId?.message}
                    />
                  )}
                />
              </Grid>

              {/* Owner Information */}
              <Grid size={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Owner Information
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="ownerName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Owner Name"
                      fullWidth
                      error={!!errors.ownerName}
                      helperText={errors.ownerName?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="ownerPhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone Number"
                      fullWidth
                      error={!!errors.ownerPhone}
                      helperText={errors.ownerPhone?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="ownerEmail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Address"
                      type="email"
                      fullWidth
                      error={!!errors.ownerEmail}
                      helperText={errors.ownerEmail?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="medicalNotes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Medical Notes"
                      multiline
                      rows={3}
                      fullWidth
                      error={!!errors.medicalNotes}
                      helperText={errors.medicalNotes?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Patient'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
