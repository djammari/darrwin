import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating appointments
const updateAppointmentSchema = z.object({
  patientId: z.string().optional(),
  customerName: z.string().min(1).max(100).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(8).max(25).optional(),
  serviceName: z.string().min(1).max(100).optional(),
  staffMember: z.string().max(50).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  durationMinutes: z.number().min(15).max(480).optional(),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'completed', 'in-progress']).optional(),
  notes: z.string().max(500).optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Function to sync appointment changes to Sesami
async function syncToSesami(appointmentId: string, action: 'update' | 'cancel') {
  try {
    // TODO: Implement Sesami API calls based on their documentation
    console.log(`🔄 Would sync ${action} for appointment ${appointmentId} to Sesami`);
    
    // Example of what this might look like:
    // const sesamiResponse = await fetch('https://api.sesami.co/v1/bookings', {
    //   method: action === 'cancel' ? 'DELETE' : 'PATCH',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.SESAMI_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     booking_id: appointmentId,
    //     // ... other data
    //   }),
    // });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to sync to Sesami:', error);
    return { success: false, error };
  }
}

// GET /api/appointments/[id] - Fetch specific appointment
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    const result = await prisma.$queryRaw`
      SELECT * FROM appointments WHERE id = ${id}
    `;
    
    const appointments = Array.isArray(result) ? result : [];
    
    if (appointments.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    const appointment = appointments[0];

    // Transform the data
    const transformedAppointment = {
      id: appointment.id,
      sesamiBookingId: appointment.sesami_booking_id,
      patientId: appointment.patient_id,
      customerName: appointment.customer_name,
      customerEmail: appointment.customer_email,
      customerPhone: appointment.customer_phone,
      serviceName: appointment.service_name,
      staffMember: appointment.staff_member,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      durationMinutes: appointment.duration_minutes,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at,
    };

    return NextResponse.json(transformedAppointment);

  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

// PUT /api/appointments/[id] - Update appointment
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate the request body
    const validationResult = updateAppointmentSchema.safeParse(body);
    
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
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        // Convert camelCase to snake_case for database
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbField} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at field
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE appointments 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    updateValues.push(id);

    const result = await prisma.$queryRawUnsafe(query, ...updateValues);
    const appointments = Array.isArray(result) ? result : [];
    
    if (appointments.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Sync changes to Sesami if this appointment came from there
    const appointment = appointments[0];
    if (appointment.sesami_booking_id) {
      await syncToSesami(appointment.sesami_booking_id, 'update');
    }

    console.log('✅ Appointment updated in Darrwin');

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
    });

  } catch (error) {
    console.error('Error updating appointment:', error);
    
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id] - Cancel/Delete appointment
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // First, get the appointment to check if it's from Sesami
    const result = await prisma.$queryRaw`
      SELECT sesami_booking_id FROM appointments WHERE id = ${id}
    `;
    
    const appointments = Array.isArray(result) ? result : [];
    
    if (appointments.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointment = appointments[0];

    // Mark as cancelled instead of deleting (better for records)
    await prisma.$executeRaw`
      UPDATE appointments SET
        status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    // Sync cancellation to Sesami if this appointment came from there
    if (appointment.sesami_booking_id) {
      await syncToSesami(appointment.sesami_booking_id, 'cancel');
    }

    console.log('✅ Appointment cancelled in Darrwin');

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
    });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}
