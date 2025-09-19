import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

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
    
    // Create table using direct SQL (bypasses Prisma schema issues)
    await sql`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(50) NOT NULL,
        breed VARCHAR(50) NOT NULL,
        birth_date TIMESTAMP NOT NULL,
        gender VARCHAR(10) NOT NULL,
        weight DECIMAL(5,2),
        color VARCHAR(30),
        microchip_id VARCHAR(20),
        owner_name VARCHAR(100) NOT NULL,
        owner_phone VARCHAR(25) NOT NULL,
        owner_email VARCHAR(100),
        medical_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Fetch patients using direct SQL
    const result = await sql`SELECT * FROM patients ORDER BY created_at DESC`;
    
    console.log(`Successfully fetched ${result.rows.length} patients`);

    // Transform the data to match frontend expectations
    const transformedPatients = result.rows.map((patient: any) => ({
      id: patient.id,
      name: patient.name,
      breed: patient.breed,
      birthDate: patient.birth_date,
      gender: patient.gender,
      weight: patient.weight ? parseFloat(patient.weight) : null,
      color: patient.color,
      microchipId: patient.microchip_id,
      ownerName: patient.owner_name,
      ownerPhone: patient.owner_phone,
      ownerEmail: patient.owner_email,
      medicalNotes: patient.medical_notes,
      createdAt: patient.created_at,
      updatedAt: patient.updated_at,
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

    // Create table first using direct SQL
    await sql`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(50) NOT NULL,
        breed VARCHAR(50) NOT NULL,
        birth_date TIMESTAMP NOT NULL,
        gender VARCHAR(10) NOT NULL,
        weight DECIMAL(5,2),
        color VARCHAR(30),
        microchip_id VARCHAR(20),
        owner_name VARCHAR(100) NOT NULL,
        owner_phone VARCHAR(25) NOT NULL,
        owner_email VARCHAR(100),
        medical_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Insert patient using direct SQL
    const result = await sql`
      INSERT INTO patients (
        name, breed, birth_date, gender, weight, color, microchip_id,
        owner_name, owner_phone, owner_email, medical_notes
      ) VALUES (
        ${data.name}, ${data.breed}, ${data.birthDate}, ${data.gender},
        ${data.weight || null}, ${data.color || null}, ${data.microchipId || null},
        ${data.ownerName}, ${data.ownerPhone}, ${data.ownerEmail || null}, ${data.medicalNotes || null}
      ) RETURNING *;
    `;

    const patient = result.rows[0];

    // Transform response to match frontend expectations
    const transformedPatient = {
      id: patient.id,
      name: patient.name,
      breed: patient.breed,
      birthDate: patient.birth_date,
      gender: patient.gender,
      weight: patient.weight ? parseFloat(patient.weight) : null,
      color: patient.color,
      microchipId: patient.microchip_id,
      ownerName: patient.owner_name,
      ownerPhone: patient.owner_phone,
      ownerEmail: patient.owner_email,
      medicalNotes: patient.medical_notes,
      createdAt: patient.created_at,
      updatedAt: patient.updated_at,
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
