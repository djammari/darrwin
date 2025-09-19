import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/test-db - Test database connection and schema
export async function GET() {
  const tests = [];
  
  // Test 1: Basic connection
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    tests.push({
      test: 'Basic Connection',
      status: 'success',
      result: result
    });
  } catch (error) {
    tests.push({
      test: 'Basic Connection',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 2: Check if patients table exists
  try {
    const patientCount = await prisma.patient.count();
    tests.push({
      test: 'Patients Table',
      status: 'success',
      result: `Found ${patientCount} patients`
    });
  } catch (error) {
    tests.push({
      test: 'Patients Table',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 3: Check database schema
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    tests.push({
      test: 'Database Schema',
      status: 'success',
      result: tables
    });
  } catch (error) {
    tests.push({
      test: 'Database Schema',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 4: Environment variables
  const envCheck = {
    POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
    DATABASE_URL: !!process.env.DATABASE_URL,
  };

  const allTestsPassed = tests.every(test => test.status === 'success');

  return NextResponse.json({
    success: allTestsPassed,
    message: allTestsPassed ? 'All database tests passed' : 'Some database tests failed',
    environment: envCheck,
    tests: tests,
    timestamp: new Date().toISOString(),
  }, {
    status: allTestsPassed ? 200 : 500
  });
}
