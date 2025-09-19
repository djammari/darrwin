import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating/updating appointments
const appointmentSchema = z.object({
  patientId: z.string().optional(), // Optional for external bookings
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(8).max(25).optional(),
  serviceName: z.string().min(1).max(100),
  staffMember: z.string().max(50).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  durationMinutes: z.number().min(15).max(480), // 15 min to 8 hours
  status: z.enum(['confirmed', 'pending', 'cancelled', 'completed', 'in-progress']),
  notes: z.string().max(500).optional(),
});

// GET /api/appointments - Fetch all appointments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    
    console.log('Fetching appointments...');
    
    // Ensure appointments table exists
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        sesami_booking_id TEXT UNIQUE,
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
    
    // Build query with optional date filtering
    let query = 'SELECT * FROM appointments';
    const params: string[] = [];
    
    if (startDate && endDate) {
      query += ' WHERE start_time >= $1 AND end_time <= $2';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY start_time ASC';
    
    const result = await prisma.$queryRawUnsafe(query, ...params);
    const appointments = Array.isArray(result) ? result : [];
    
    console.log(`Found ${appointments.length} appointments`);

    // Transform the data for the calendar
    const transformedAppointments = appointments.map((apt) => ({
      id: apt.id,
      sesamiBookingId: apt.sesami_booking_id,
      patientId: apt.patient_id,
      customerName: apt.customer_name,
      customerEmail: apt.customer_email,
      customerPhone: apt.customer_phone,
      serviceName: apt.service_name,
      staffMember: apt.staff_member,
      startTime: apt.start_time,
      endTime: apt.end_time,
      durationMinutes: apt.duration_minutes,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.created_at,
      updatedAt: apt.updated_at,
    }));

    return NextResponse.json(transformedAppointments);

  } catch (error) {
    console.error('Error fetching appointments:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch appointments',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create new appointment (from Darrwin)
export async function POST(request: NextRequest) {
  try {
    console.log('Creating new appointment from Darrwin...');
    
    const body = await request.json();
    
    // Validate the request body
    const validationResult = appointmentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Create appointment in database
    await prisma.$executeRaw`
      INSERT INTO appointments (
        patient_id, customer_name, customer_email, customer_phone,
        service_name, staff_member, start_time, end_time, duration_minutes,
        status, notes
      ) VALUES (
        ${data.patientId || null}, ${data.customerName}, ${data.customerEmail || null}, 
        ${data.customerPhone || null}, ${data.serviceName}, ${data.staffMember || null},
        ${data.startTime}, ${data.endTime}, ${data.durationMinutes},
        ${data.status}, ${data.notes || null}
      )
    `;

    // TODO: If this appointment needs to be synced to Sesami, call their API here
    // await syncToSesami(appointmentData);
    
    console.log('✅ Appointment created in Darrwin');

    return NextResponse.json({
      success: true,
      message: 'Appointment created successfully',
      // appointment: result,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating appointment:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to create appointment',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
