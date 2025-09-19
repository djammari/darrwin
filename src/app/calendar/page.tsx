'use client';

import { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, Views, Event } from 'react-big-calendar';
import moment from 'moment';
import {
  Container,
  Typography,
  Box,
  Button,
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
  Paper,
  Chip,
  Grid2 as Grid
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Appointment interface
interface CalendarEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patientId?: string;
  patientName?: string;
  appointmentType: 'checkup' | 'surgery' | 'emergency' | 'consultation';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

// Patient interface (simplified)
interface Patient {
  id: string;
  name: string;
  breed: string;
}

// Form validation schema
const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  patientId: z.string().min(1, 'Patient is required'),
  appointmentType: z.enum(['checkup', 'surgery', 'emergency', 'consultation']),
  startTime: z.date({ required_error: 'Start time is required' }),
  endTime: z.date({ required_error: 'End time is required' }),
  notes: z.string().max(500, 'Notes too long').optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

// Custom event component for the calendar
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#2196f3';
      case 'in-progress': return '#ff9800';
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <Box 
      sx={{ 
        backgroundColor: getStatusColor(event.status),
        color: 'white',
        p: 0.5,
        borderRadius: 1,
        fontSize: '0.75rem',
        overflow: 'hidden'
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
        {event.title}
      </Typography>
      {event.patientName && (
        <Typography variant="caption" sx={{ opacity: 0.9 }}>
          {event.patientName}
        </Typography>
      )}
    </Box>
  );
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      appointmentType: 'checkup',
      notes: '',
    }
  });

  // Load patients and appointments
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load patients
      const patientsResponse = await fetch('/api/patients');
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);
      }

      // Load appointments from API
      const appointmentsResponse = await fetch('/api/appointments');
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        
        // Transform appointments to calendar events
        const calendarEvents: CalendarEvent[] = appointmentsData.map((apt: {
          id: string;
          serviceName: string;
          customerName: string;
          startTime: string;
          endTime: string;
          patientId?: string;
          status: string;
          notes?: string;
        }) => ({
          id: apt.id,
          title: `${apt.serviceName} - ${apt.customerName}`,
          start: new Date(apt.startTime),
          end: new Date(apt.endTime),
          patientId: apt.patientId,
          patientName: apt.customerName,
          appointmentType: apt.serviceName.toLowerCase().includes('surgery') ? 'surgery' :
                          apt.serviceName.toLowerCase().includes('emergency') ? 'emergency' :
                          apt.serviceName.toLowerCase().includes('consultation') ? 'consultation' : 'checkup',
          status: apt.status === 'confirmed' ? 'scheduled' : 
                  apt.status === 'in-progress' ? 'in-progress' :
                  apt.status === 'completed' ? 'completed' :
                  apt.status === 'cancelled' ? 'cancelled' : 'scheduled',
          notes: apt.notes,
        }));
        
        setEvents(calendarEvents);
      } else {
        // Fallback to demo data if API fails
        const demoEvents: CalendarEvent[] = [
          {
            id: '1',
            title: 'Checkup - Buddy',
            start: new Date(2025, 8, 19, 10, 0),
            end: new Date(2025, 8, 19, 10, 30),
            patientId: '1',
            patientName: 'Buddy',
            appointmentType: 'checkup',
            status: 'scheduled',
          },
        ];
        setEvents(demoEvents);
      }
      
      setError(null);
    } catch {
      setError('Failed to load calendar data');
    }
  };

  // Handle selecting a time slot
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setValue('startTime', start);
    setValue('endTime', end);
    setDialogOpen(true);
  }, [setValue]);


  // Handle clicking on events
  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('Event clicked:', event);
    // TODO: Open edit dialog
  }, []);

  // Submit new appointment
  const onSubmit = async (data: AppointmentFormData) => {
    try {
      // Find the selected patient
      const selectedPatient = patients.find(p => p.id === data.patientId);
      
      // Calculate duration in minutes
      const durationMinutes = Math.round((data.endTime.getTime() - data.startTime.getTime()) / 60000);
      
      // Prepare appointment data for API
      const appointmentData = {
        patientId: data.patientId,
        customerName: selectedPatient?.name || 'Unknown Patient',
        customerEmail: '', // We'll get this from patient data later
        customerPhone: '', // We'll get this from patient data later
        serviceName: data.title,
        staffMember: 'Dr. Veterinarian', // TODO: Add staff selection
        startTime: data.startTime.toISOString(),
        endTime: data.endTime.toISOString(),
        durationMinutes,
        status: 'confirmed',
        notes: data.notes || '',
      };

      // Save to database via API
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        // Reload calendar data to show the new appointment
        await loadData();
        setDialogOpen(false);
        reset();
        console.log('✅ Appointment created successfully');
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch {
      console.error('Error creating appointment');
      setError('Failed to create appointment');
    }
  };

  // Custom event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const getColor = () => {
      switch (event.status) {
        case 'scheduled': return '#2196f3';
        case 'in-progress': return '#ff9800';
        case 'completed': return '#4caf50';
        case 'cancelled': return '#f44336';
        default: return '#9e9e9e';
      }
    };

    return {
      style: {
        backgroundColor: getColor(),
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            📅 Appointment Calendar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule and manage patient appointments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          size="large"
        >
          New Appointment
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Legend */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appointment Status
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip label="Scheduled" sx={{ backgroundColor: '#2196f3', color: 'white' }} />
          <Chip label="In Progress" sx={{ backgroundColor: '#ff9800', color: 'white' }} />
          <Chip label="Completed" sx={{ backgroundColor: '#4caf50', color: 'white' }} />
          <Chip label="Cancelled" sx={{ backgroundColor: '#f44336', color: 'white' }} />
        </Box>
      </Paper>

      {/* Calendar */}
      <Paper sx={{ p: 2, height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleEventClick}
          selectable
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
          }}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          defaultView={Views.WEEK}
          step={15}
          timeslots={4}
          min={new Date(0, 0, 0, 8, 0, 0)} // 8 AM
          max={new Date(0, 0, 0, 18, 0, 0)} // 6 PM
        />
      </Paper>

      {/* New Appointment Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => {
          setDialogOpen(false);
          reset();
        }}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarIcon />
              Schedule New Appointment
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Appointment Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      required
                      placeholder="e.g., Annual Checkup, Vaccination, Surgery"
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="patientId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.patientId} required>
                      <InputLabel>Patient</InputLabel>
                      <Select {...field} label="Patient">
                        {patients.map((patient) => (
                          <MenuItem key={patient.id} value={patient.id}>
                            {patient.name} - {patient.breed}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.patientId && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors.patientId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="appointmentType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required>
                      <InputLabel>Appointment Type</InputLabel>
                      <Select {...field} label="Appointment Type">
                        <MenuItem value="checkup">Routine Checkup</MenuItem>
                        <MenuItem value="consultation">Consultation</MenuItem>
                        <MenuItem value="surgery">Surgery</MenuItem>
                        <MenuItem value="emergency">Emergency</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="Start Time"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.startTime,
                          helperText: errors.startTime?.message,
                          required: true,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="End Time"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endTime,
                          helperText: errors.endTime?.message,
                          required: true,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes"
                      multiline
                      rows={3}
                      fullWidth
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                      placeholder="Any additional notes for this appointment..."
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setDialogOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              startIcon={<CalendarIcon />}
            >
              Schedule Appointment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
