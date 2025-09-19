import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { PatientWithCounts } from '@/types/database';

// Validation schema for creating a new patient
const createPatientSchema = z.object({
  name: z.string().min(1).max(50),
  breed: z.string().min(1).max(50),
  birthDate: z.string().datetime(),
  gender: z.enum(['male', 'female']),
  weight: z.number().min(0.1).max(200).optional(),
  color: z.string().max(30).optional(),
  microchipId: z.string().max(20).optional(),
  ownerName: z.string().min(1).max(100),
  ownerPhone: z.string().min(8).max(25),
  ownerEmail: z.string().email().optional(),
  medicalNotes: z.string().max(500).optional(),
});

// GET /api/patients - Fetch all patients
export async function GET() {
  try {
    console.log('Attempting to fetch patients from database...');
    
    // First, try to ensure the patients table exists
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "patients" (
          "id" TEXT NOT NULL,
          "name" VARCHAR(50) NOT NULL,
          "breed" VARCHAR(50) NOT NULL,
          "birthDate" TIMESTAMP(3) NOT NULL,
          "gender" TEXT NOT NULL,
          "weight" DOUBLE PRECISION,
          "color" VARCHAR(30),
          "microchipId" VARCHAR(20),
          "ownerName" VARCHAR(100) NOT NULL,
          "ownerPhone" VARCHAR(25) NOT NULL,
          "ownerEmail" VARCHAR(100),
          "medicalNotes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
        );
      `;
      console.log('✅ Patients table ensured');
    } catch (tableError) {
      console.log('Table might already exist or creation failed:', tableError);
    }
    
    const patients = await prisma.patient.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            appointments: true,
            sessions: true,
          },
        },
      },
    });
    
    console.log(`Successfully fetched ${patients.length} patients`);

    // Transform the data to match frontend expectations
    const transformedPatients = patients.map((patient: PatientWithCounts) => ({
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
      appointmentCount: patient._count.appointments,
      sessionCount: patient._count.sessions,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    }));

    return NextResponse.json(transformedPatients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Failed to fetch patients',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    console.log('Attempting to create new patient...');
    
    const body = await request.json();
    console.log('Received patient data:', JSON.stringify(body, null, 2));
    
    // Validate the request body
    const validationResult = createPatientSchema.safeParse(body);
    
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
    
    // Convert gender to uppercase for database enum
    const patientData = {
      ...data,
      gender: data.gender.toUpperCase() as 'MALE' | 'FEMALE',
      birthDate: new Date(data.birthDate),
    };

    // Ensure the table exists before creating
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "patients" (
          "id" TEXT NOT NULL,
          "name" VARCHAR(50) NOT NULL,
          "breed" VARCHAR(50) NOT NULL,
          "birthDate" TIMESTAMP(3) NOT NULL,
          "gender" TEXT NOT NULL,
          "weight" DOUBLE PRECISION,
          "color" VARCHAR(30),
          "microchipId" VARCHAR(20),
          "ownerName" VARCHAR(100) NOT NULL,
          "ownerPhone" VARCHAR(25) NOT NULL,
          "ownerEmail" VARCHAR(100),
          "medicalNotes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
        );
      `;
      console.log('✅ Patients table ensured for creation');
    } catch (tableError) {
      console.log('Table creation check:', tableError);
    }

    // Create the patient in the database
    console.log('Creating patient with data:', JSON.stringify(patientData, null, 2));
    
    const patient = await prisma.patient.create({
      data: patientData,
    });
    
    console.log('Successfully created patient:', patient.id);

    // Transform response to match frontend expectations
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
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedPatient, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Failed to create patient',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
