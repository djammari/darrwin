import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid2 as Grid,
  Chip
} from '@mui/material';
import Link from 'next/link';
import { 
  CalendarToday, 
  Pets, 
  Assignment, 
  Dashboard 
} from '@mui/icons-material';
// import { vetCard, patientCard, appointmentSlot } from '../styles/components.css';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom>
          🐾 VetPractice Pro
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Professional Veterinary Practice Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Streamline your veterinary practice with scheduling, patient records, and session tracking
        </Typography>
      </Box>

      <Grid container spacing={3} mb={6}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ 
            borderRadius: 2, 
            p: 3, 
            boxShadow: 1,
            transition: 'all 0.3s ease-in-out',
            '&:hover': { 
              boxShadow: 3, 
              transform: 'translateY(-2px)' 
            } 
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Smart Scheduling
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drag-and-drop calendar with appointment management
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ 
            borderRadius: 2, 
            p: 3, 
            boxShadow: 1,
            transition: 'all 0.3s ease-in-out',
            '&:hover': { 
              boxShadow: 3, 
              transform: 'translateY(-2px)' 
            } 
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Pets sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Patient Profiles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete patient records with breed, age, and medical history
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ 
            borderRadius: 2, 
            p: 3, 
            boxShadow: 1,
            transition: 'all 0.3s ease-in-out',
            '&:hover': { 
              boxShadow: 3, 
              transform: 'translateY(-2px)' 
            } 
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Session Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track progress, treatments, and homework for each visit
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ 
            borderRadius: 2, 
            p: 3, 
            boxShadow: 1,
            transition: 'all 0.3s ease-in-out',
            '&:hover': { 
              boxShadow: 3, 
              transform: 'translateY(-2px)' 
            } 
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Dashboard sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                File Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Store and organize scan results, x-rays, and documents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Preview: Styling System
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Material UI components with custom styling using the sx prop (Vanilla Extract integration coming next)
        </Typography>
        
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ 
              p: 2, 
              m: 1, 
              borderRadius: 2, 
              border: 2, 
              borderColor: 'primary.main',
              backgroundColor: '#e3f2fd',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out' 
            }}>
              <Typography variant="h6">Buddy - Golden Retriever</Typography>
              <Typography variant="body2" color="text.secondary">Next appointment: Today 2:00 PM</Typography>
              <Box mt={1}>
                <Chip label="Active" color="primary" size="small" />
              </Box>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ 
              p: 2, 
              m: 1, 
              borderRadius: 2, 
              border: 2, 
              borderColor: 'success.main',
              backgroundColor: '#e8f5e8',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out' 
            }}>
              <Typography variant="h6">Luna - Persian Cat</Typography>
              <Typography variant="body2" color="text.secondary">Last visit: Yesterday 10:30 AM</Typography>
              <Box mt={1}>
                <Chip label="Completed" color="success" size="small" />
              </Box>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ 
              p: 2, 
              m: 1, 
              borderRadius: 2, 
              border: 2, 
              borderColor: 'error.main',
              backgroundColor: '#ffebee',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out' 
            }}>
              <Typography variant="h6">Max - German Shepherd</Typography>
              <Typography variant="body2" color="text.secondary">Emergency visit needed</Typography>
              <Box mt={1}>
                <Chip label="Urgent" color="error" size="small" />
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Appointment Status Examples:
        </Typography>
        <Grid container spacing={1}>
          <Grid size={{ xs: 6, md: 2 }}>
            <Box sx={{ 
              borderRadius: 1, 
              p: 1, 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              textAlign: 'center', 
              color: 'white', 
              minHeight: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#2196f3'
            }}>
              Scheduled
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Box sx={{ 
              borderRadius: 1, 
              p: 1, 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              textAlign: 'center', 
              color: 'white', 
              minHeight: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#ff9800'
            }}>
              In Progress
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Box sx={{ 
              borderRadius: 1, 
              p: 1, 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              textAlign: 'center', 
              color: 'white', 
              minHeight: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#4caf50'
            }}>
              Completed
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Box sx={{ 
              borderRadius: 1, 
              p: 1, 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              textAlign: 'center', 
              color: 'white', 
              minHeight: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f44336'
            }}>
              Cancelled
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Box sx={{ 
              borderRadius: 1, 
              p: 1, 
              fontSize: '0.875rem', 
              fontWeight: 500, 
              textAlign: 'center', 
              color: 'white', 
              minHeight: '40px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#9c27b0'
            }}>
              Rescheduled
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Box textAlign="center" mt={6}>
        <Link href="/patients" passHref>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<Pets />}
            sx={{ mr: 2 }}
          >
            Manage Patients
          </Button>
        </Link>
        <Button 
          variant="outlined" 
          size="large"
          startIcon={<CalendarToday />}
          disabled
        >
          View Calendar (Coming Soon)
        </Button>
      </Box>
    </Container>
  );
}
