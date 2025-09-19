import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for updating a patient
const updatePatientSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  breed: z.string().min(1).max(50).optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.enum(['male', 'female']).optional(),
  weight: z.number().min(0.1).max(200).optional(),
  color: z.string().max(30).optional(),
  microchipId: z.string().max(20).optional(),
  ownerName: z.string().min(1).max(100).optional(),
  ownerPhone: z.string().min(10).max(20).optional(),
  ownerEmail: z.string().email().optional(),
  medicalNotes: z.string().max(500).optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/patients/[id] - Fetch a specific patient
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    const patient = await prisma.patient.findUnique({
      where: { id },
    });
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Transform the data to match frontend expectations
    const transformedPatient = {
      id: patient.id,
      name: patient.name,
      breed: patient.breed,
      birthDate: patient.birthDate.toISOString(),
      gender: patient.gender.toLowerCase(),
      weight: patient.weight,
      color: patient.color,
      microchipId: patient.microchipId,
      ownerName: patient.ownerName,
      ownerPhone: patient.ownerPhone,
      ownerEmail: patient.ownerEmail,
      medicalNotes: patient.medicalNotes,
      appointments: [], // We'll add this later
      sessions: [], // We'll add this later
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedPatient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// PUT /api/patients/[id] - Update a specific patient
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate the request body
    const validationResult = updatePatientSchema.safeParse(body);
    
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
    
    // Prepare update data
    const updateData: Record<string, unknown> = { ...data };
    
    if (data.gender) {
      updateData.gender = data.gender.toUpperCase() as 'MALE' | 'FEMALE';
    }
    
    if (data.birthDate) {
      updateData.birthDate = new Date(data.birthDate);
    }

    // Update functionality coming soon
    return NextResponse.json(
      { error: 'Update functionality coming soon' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error updating patient:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}

// DELETE /api/patients/[id] - Delete a specific patient
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patient:', error);
    
    // Handle specific errors
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
}
