// This is just a helper script to test the ingestion logic manually.
// You can use this data in Postman or run it directly to see the payloads.

const runTest = () => {
  const samplePayload = {
    userId: 'test_user_456',
    emails: [
      {
        merchant: 'Netflix',
        amount: 499,
        date: '2026-01-20',
        currency: 'INR',
        billingCycle: 'monthly'
      },
      {
        merchant: 'Spotify',
        amount: 119,
        date: '2026-01-15',
        currency: 'INR',
        billingCycle: 'monthly'
      }
    ]
  };

  console.log('--- Payload for the first run (adding new subs) ---');
  console.log(JSON.stringify(samplePayload, null, 2));
  
  console.log('\n--- Payload for checking duplicates (should skip these) ---');
  // Just send the same thing again to see if deduplication works!
  console.log(JSON.stringify(samplePayload, null, 2));

  console.log('\nTo test this:');
  console.log('1. Make sure your server is running (npm start)');
  console.log('2. Send a POST request to http://localhost:5000/api/email/ingest');
};

runTest();
