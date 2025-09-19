import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Sesami webhook payload schema
const sesamiWebhookSchema = z.object({
  event_type: z.enum(['booking.created', 'booking.updated', 'booking.cancelled']),
  booking: z.object({
    id: z.string(),
    customer: z.object({
      name: z.string(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    }),
    service: z.object({
      name: z.string(),
      duration: z.number(), // in minutes
      staff_member: z.string().optional(),
    }),
    appointment_time: z.string().datetime(),
    status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']),
    notes: z.string().optional(),
    // Add any other fields Sesami sends
  }),
  shop: z.object({
    domain: z.string(),
  }),
  timestamp: z.string().datetime(),
});

// POST /api/webhooks/sesami - Handle Sesami booking webhooks
export async function POST(request: NextRequest) {
  try {
    console.log('📥 Received Sesami webhook');
    
    // Verify webhook signature (you'll need to add this based on Sesami's docs)
    // const signature = request.headers.get('x-sesami-signature');
    // if (!verifyWebhookSignature(body, signature)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const body = await request.json();
    console.log('Webhook payload:', JSON.stringify(body, null, 2));
    
    // Validate the webhook payload
    const validationResult = sesamiWebhookSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('Invalid webhook payload:', validationResult.error);
      return NextResponse.json(
        { 
          error: 'Invalid webhook payload', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { event_type, booking } = validationResult.data;
    
    // Ensure appointments table exists
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        sesami_booking_id TEXT UNIQUE NOT NULL,
        patient_id TEXT,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        service_name TEXT NOT NULL,
        staff_member TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        duration_minutes INTEGER NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Calculate end time based on start time and duration
    const startTime = new Date(booking.appointment_time);
    const endTime = new Date(startTime.getTime() + booking.service.duration * 60000);

    switch (event_type) {
      case 'booking.created':
        console.log('🆕 Creating new appointment from Sesami booking');
        
        // Check if appointment already exists
        const existingAppointment = await prisma.$queryRaw`
          SELECT id FROM appointments WHERE sesami_booking_id = ${booking.id}
        `;
        
        if (Array.isArray(existingAppointment) && existingAppointment.length === 0) {
          // Create new appointment
          await prisma.$executeRaw`
            INSERT INTO appointments (
              id, sesami_booking_id, customer_name, customer_email, customer_phone,
              service_name, staff_member, start_time, end_time, duration_minutes,
              status, notes
            ) VALUES (
              ${`apt_${Date.now()}`}, ${booking.id}, ${booking.customer.name},
              ${booking.customer.email || null}, ${booking.customer.phone || null},
              ${booking.service.name}, ${booking.service.staff_member || null},
              ${startTime.toISOString()}, ${endTime.toISOString()}, ${booking.service.duration},
              ${booking.status}, ${booking.notes || null}
            )
          `;
          
          console.log('✅ Appointment created from Sesami booking');
        }
        break;

      case 'booking.updated':
        console.log('📝 Updating appointment from Sesami booking');
        
        await prisma.$executeRaw`
          UPDATE appointments SET
            customer_name = ${booking.customer.name},
            customer_email = ${booking.customer.email || null},
            customer_phone = ${booking.customer.phone || null},
            service_name = ${booking.service.name},
            staff_member = ${booking.service.staff_member || null},
            start_time = ${startTime.toISOString()},
            end_time = ${endTime.toISOString()},
            duration_minutes = ${booking.service.duration},
            status = ${booking.status},
            notes = ${booking.notes || null},
            updated_at = CURRENT_TIMESTAMP
          WHERE sesami_booking_id = ${booking.id}
        `;
        
        console.log('✅ Appointment updated from Sesami booking');
        break;

      case 'booking.cancelled':
        console.log('❌ Cancelling appointment from Sesami booking');
        
        await prisma.$executeRaw`
          UPDATE appointments SET
            status = 'cancelled',
            updated_at = CURRENT_TIMESTAMP
          WHERE sesami_booking_id = ${booking.id}
        `;
        
        console.log('✅ Appointment cancelled from Sesami booking');
        break;
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Processed ${event_type} for booking ${booking.id}`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/webhooks/sesami - Test endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Sesami webhook endpoint is ready',
    webhook_url: `${process.env.NEXTAUTH_URL || 'https://your-app.vercel.app'}/api/webhooks/sesami`,
    supported_events: ['booking.created', 'booking.updated', 'booking.cancelled'],
    timestamp: new Date().toISOString(),
  });
}
