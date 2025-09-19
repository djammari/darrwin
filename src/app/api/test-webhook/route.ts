import { NextResponse } from 'next/server';

// POST /api/test-webhook - Send a test webhook to simulate Sesami
export async function POST() {
  try {
    console.log('🧪 Sending test webhook to simulate Sesami booking...');
    
    // Create a test booking payload that matches your Sesami format
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

    // Send the webhook to our own endpoint
    const webhookUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/sesami`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking),
    });

    const result = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Test webhook sent successfully!',
        testBooking,
        webhookResponse: result,
        instructions: {
          step1: 'Check your calendar at /calendar',
          step2: 'You should see the test appointment',
          step3: 'This proves your Sesami integration is working'
        }
      });
    } else {
      throw new Error(`Webhook failed: ${JSON.stringify(result)}`);
    }

  } catch (error) {
    console.error('❌ Test webhook failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Test webhook failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: {
          check1: 'Make sure your app is running',
          check2: 'Check the webhook endpoint exists',
          check3: 'Verify database connection'
        }
      },
      { status: 500 }
    );
  }
}

// GET /api/test-webhook - Show test instructions
export async function GET() {
  return NextResponse.json({
    message: 'Sesami Webhook Test Endpoint',
    instructions: {
      howToTest: 'Send a POST request to this endpoint to simulate a Sesami booking',
      testUrl: '/api/test-webhook',
      method: 'POST',
      whatHappens: [
        '1. Creates a fake booking payload',
        '2. Sends it to your webhook endpoint',
        '3. Check /calendar to see the appointment appear'
      ]
    },
    webhookEndpoint: '/api/webhooks/sesami',
    calendarUrl: '/calendar',
    timestamp: new Date().toISOString(),
  });
}
