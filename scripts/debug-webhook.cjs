const { spawn } = require('child_process');
const { readFileSync } = require('fs');

console.log('🔍 Debugging WhatsApp Webhook Setup...\n');

// 1. Check environment variables
console.log('1. Checking environment variables...');
const envContent = readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');

const requiredVars = [
  'WHATSAPP_VERIFY_TOKEN',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_BUSINESS_ACCOUNT_ID',
  'DATABASE_URL'
];

requiredVars.forEach(varName => {
  const line = envLines.find(line => line.startsWith(varName));
  if (line) {
    const value = line.split('=')[1];
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

// 2. Run a simple database check using Prisma or direct SQL
console.log('\n2. Testing database connection...');
const dbTest = spawn('node', ['-e', `
  const { Client } = require('pg');
  require('dotenv').config({ path: '.env.local' });
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  client.connect()
    .then(() => {
      console.log('✅ Database connection successful');
      return client.query('SELECT version();');
    })
    .then(res => {
      console.log('PostgreSQL version:', res.rows[0].version);
      client.end();
    })
    .catch(err => {
      console.log('❌ Database connection failed:', err.message);
      client.end();
    });
`], { stdio: 'inherit' });

dbTest.on('close', (code) => {
  console.log('\n💡 Suggestions:');
  console.log('   • Make sure your webhook URL is correctly set in Meta Developer Portal');
  console.log('   • Verify that your phone number is verified in WhatsApp Business Manager');
  console.log('   • Ensure your app has the required permissions');
  console.log('   • Check that your agent is configured with auto-reply enabled');
  console.log('   • Verify that your OpenAI API key is working');
});