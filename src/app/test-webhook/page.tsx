'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  PlayArrow as TestIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import Link from 'next/link';

export default function TestWebhookPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    testBooking: Record<string, unknown>;
    webhookResponse: Record<string, unknown>;
    instructions: Record<string, unknown>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      console.log('🧪 Running Sesami webhook test...');

      // Create test booking payload that matches your Sesami format
      const testBooking = {
        "event": "appointment.created",
        "sent_at": new Date().toISOString(),
        "booking": {
          "id": `test_booking_${Date.now()}`,
          "status": "confirmed",
          "service_id": "service_123",
          "service_title": "Dog Grooming and Health Check",
          "starts_at": new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          "ends_at": new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
          "time_zone": "America/New_York",
          "resource_id": "vet_room_1",
          "resource_name": "Examination Room 1"
        },
        "customer": {
          "shopify_customer_id": "shopify_123456",
          "name": "Test Customer",
          "email": "test@example.com",
          "phone": "+1-555-TEST"
        },
        "metadata": {
          "notes": "First time customer - be gentle with the dog",
          "tags": "new-customer,grooming",
          "source": "sesami"
        }
      };

      // Send directly to the actual webhook endpoint
      const response = await fetch('/api/webhooks/sesami', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testBooking),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        console.log('✅ Test webhook successful:', data);
      } else {
        throw new Error(data.details || 'Test failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ Test webhook failed:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          🧪 Test Sesami Webhook Integration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Test your webhook integration before going live with your Shopify store
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How This Test Works:
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            1. Clicking &quot;Run Test&quot; simulates a customer booking on your Shopify store
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            2. It sends the exact same webhook payload that Sesami would send
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            3. Your webhook endpoint processes it and creates an appointment
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            4. You can then check your calendar to see the appointment appear
          </Typography>
        </CardContent>
      </Card>

      <Box textAlign="center" mb={4}>
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <TestIcon />}
          onClick={runTest}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? 'Testing...' : 'Run Webhook Test'}
        </Button>
        
        <Link href="/calendar" passHref>
          <Button
            variant="outlined"
            size="large"
            startIcon={<CalendarIcon />}
          >
            View Calendar
          </Button>
        </Link>
      </Box>

      {/* Success Result */}
      {result && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <SuccessIcon />
            <Typography variant="h6">
              Test Successful! 🎉
            </Typography>
          </Box>
          
          <Typography variant="body2" paragraph>
            <strong>Webhook Response:</strong> {result.message}
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>Test Booking Created:</strong>
          </Typography>
          <Box component="pre" sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            fontSize: '0.875rem',
            overflow: 'auto'
          }}>
            {JSON.stringify(result.testBooking, null, 2)}
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Next Steps:
          </Typography>
          <Typography variant="body2">
            1. Check your calendar to see the test appointment
          </Typography>
          <Typography variant="body2">
            2. Configure your Sesami webhook URL
          </Typography>
          <Typography variant="body2">
            3. Start accepting real bookings!
          </Typography>
        </Alert>
      )}

      {/* Error Result */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <ErrorIcon />
            <Typography variant="h6">
              Test Failed
            </Typography>
          </Box>
          <Typography variant="body2">
            <strong>Error:</strong> {error}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Check the browser console for more details.
          </Typography>
        </Alert>
      )}

      {/* Webhook Configuration */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔗 Sesami Webhook Configuration
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Once your test passes, configure this URL in your Sesami settings:
          </Typography>
          
          <Box sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1, 
            fontFamily: 'monospace',
            mb: 2
          }}>
            https://darrwin-ea38.vercel.app/api/webhooks/sesami
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            <strong>Events to enable:</strong> appointment.created, appointment.updated, appointment.cancelled
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
