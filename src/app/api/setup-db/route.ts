import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/setup-db - Create database tables
export async function POST() {
  try {
    console.log('🔧 Setting up database tables...');
    
    // This will create all tables based on the Prisma schema
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

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "appointments" (
        "id" TEXT NOT NULL,
        "startTime" TIMESTAMP(3) NOT NULL,
        "endTime" TIMESTAMP(3) NOT NULL,
        "title" VARCHAR(100) NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
        "patientId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" TEXT NOT NULL,
        "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "duration" INTEGER,
        "symptoms" TEXT,
        "diagnosis" TEXT,
        "treatment" TEXT,
        "notes" TEXT,
        "homework" TEXT,
        "nextVisitDate" TIMESTAMP(3),
        "followUpNotes" TEXT,
        "attachments" TEXT[],
        "patientId" TEXT NOT NULL,
        "appointmentId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
      );
    `;

    console.log('✅ Database tables created successfully');

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Database setup failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET /api/setup-db - Check database status
export async function GET() {
  try {
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if patients table exists
    const patientCount = await prisma.patient.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database is working',
      patientCount,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Database not ready',
        error: error instanceof Error ? error.message : 'Unknown error',
        needsSetup: true,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
