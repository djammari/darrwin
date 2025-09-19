const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Found tables:', tables.map(t => t.table_name));
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. You need to run: npx prisma db push');
    } else {
      console.log('✅ Database schema exists');
      
      // Test patient table specifically
      try {
        const patientCount = await prisma.patient.count();
        console.log(`👥 Found ${patientCount} patients in database`);
      } catch (error) {
        console.log('❌ Error accessing patients table:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your environment variables in Vercel');
    console.log('2. Make sure POSTGRES_PRISMA_URL is set');
    console.log('3. Run: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
