import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Sesami webhook payload schema (matching your exact format)
const sesamiWebhookSchema = z.object({
  event: z.enum(['appointment.created', 'appointment.updated', 'appointment.cancelled']),
  sent_at: z.string(),
  booking: z.object({
    id: z.string(),
    status: z.string(),
    service_id: z.string(),
    service_title: z.string(),
    starts_at: z.string(), // ISO datetime
    ends_at: z.string(),   // ISO datetime
    time_zone: z.string(),
    resource_id: z.string().optional(),
    resource_name: z.string().optional(),
  }),
  customer: z.object({
    shopify_customer_id: z.string().optional(),
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
  metadata: z.object({
    notes: z.string().optional(),
    tags: z.string().optional(),
    source: z.string(),
  }),
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

    const { event, booking, customer, metadata } = validationResult.data;
    
    // Ensure appointments table exists and has all required columns
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        sesami_booking_id TEXT UNIQUE,
        patient_id TEXT,
        customer_name TEXT NOT NULL,
        customer_email TEXT,
        customer_phone TEXT,
        shopify_customer_id TEXT,
        service_id TEXT,
        service_name TEXT NOT NULL,
        resource_id TEXT,
        resource_name TEXT,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        time_zone TEXT,
        status TEXT NOT NULL,
        notes TEXT,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Add missing columns if they don't exist (for existing tables)
    try {
      await prisma.$executeRaw`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS sesami_booking_id TEXT UNIQUE`;
      await prisma.$executeRaw`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS shopify_customer_id TEXT`;
      await prisma.$executeRaw`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS service_id TEXT`;
      await prisma.$executeRaw`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS resource_id TEXT`;
      await prisma.$executeRaw`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS resource_name TEXT`;
      await prisma.$executeRaw`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS time_zone TEXT`;
      await prisma.$executeRaw`ALTER TABLE appointments ADD COLUMN IF NOT EXISTS tags TEXT`;
      console.log('✅ Appointments table updated with Sesami columns');
    } catch (alterError) {
      console.log('Table columns might already exist:', alterError);
    }

    // Parse start and end times
    const startTime = new Date(booking.starts_at);
    const endTime = new Date(booking.ends_at);

    switch (event) {
      case 'appointment.created':
        console.log('🆕 Creating new appointment from Sesami booking');
        
        // Check if appointment already exists
        const existingAppointment = await prisma.$queryRaw`
          SELECT id FROM appointments WHERE sesami_booking_id = ${booking.id}
        `;
        
        if (Array.isArray(existingAppointment) && existingAppointment.length === 0) {
          // Create new appointment
          await prisma.$executeRaw`
            INSERT INTO appointments (
              sesami_booking_id, customer_name, customer_email, customer_phone,
              shopify_customer_id, service_id, service_name, resource_id, resource_name,
              start_time, end_time, time_zone, status, notes, tags
            ) VALUES (
              ${booking.id}, ${customer.name}, ${customer.email || null}, ${customer.phone || null},
              ${customer.shopify_customer_id || null}, ${booking.service_id}, ${booking.service_title},
              ${booking.resource_id || null}, ${booking.resource_name || null},
              ${startTime.toISOString()}, ${endTime.toISOString()}, ${booking.time_zone},
              ${booking.status}, ${metadata.notes || null}, ${metadata.tags || null}
            )
          `;
          
          console.log('✅ Appointment created from Sesami booking');
        }
        break;

      case 'appointment.updated':
        console.log('📝 Updating appointment from Sesami booking');
        
        await prisma.$executeRaw`
          UPDATE appointments SET
            customer_name = ${customer.name},
            customer_email = ${customer.email || null},
            customer_phone = ${customer.phone || null},
            service_name = ${booking.service_title},
            resource_name = ${booking.resource_name || null},
            start_time = ${startTime.toISOString()},
            end_time = ${endTime.toISOString()},
            time_zone = ${booking.time_zone},
            status = ${booking.status},
            notes = ${metadata.notes || null},
            tags = ${metadata.tags || null},
            updated_at = CURRENT_TIMESTAMP
          WHERE sesami_booking_id = ${booking.id}
        `;
        
        console.log('✅ Appointment updated from Sesami booking');
        break;

      case 'appointment.cancelled':
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
      message: `Processed ${event} for booking ${booking.id}`,
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
    supported_events: ['appointment.created', 'appointment.updated', 'appointment.cancelled'],
    timestamp: new Date().toISOString(),
  });
}
