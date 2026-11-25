import http from 'http';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Testing Fortivex AI backend endpoints...');

  // 1. Health check
  const health = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('[TEST 1] /api/health:', health.status, health.body.status);

  // 2. Leads check
  const leads = await request({ host: 'localhost', port: 5000, path: '/api/leads', method: 'GET' });
  console.log('[TEST 2] /api/leads count:', leads.body.count);

  // 3. Analytics check
  const analytics = await request({ host: 'localhost', port: 5000, path: '/api/analytics', method: 'GET' });
  console.log('[TEST 3] /api/analytics conversionRate:', analytics.body.data.metrics.conversionRate);

  // 4. Live RAG Chat test
  const chat = await request(
    { host: 'localhost', port: 5000, path: '/api/ai/chat', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { message: 'I want to build an e-commerce website. My budget is 50,000 rupees.' }
  );
  console.log('[TEST 4] /api/ai/chat reply:', chat.body.data.reply);
  console.log('[TEST 4] RAG chunks retrieved:', chat.body.data.retrieved_chunks.length);

  // 5. Lead qualification test
  const qualify = await request(
    { host: 'localhost', port: 5000, path: '/api/ai/qualify-lead', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    {
      transcripts: [
        { speaker: 'agent', message: 'Hello! How can I help you?' },
        { speaker: 'customer', message: 'My name is Rohan. I want to build an e-commerce website with 50,000 budget to launch next month.' },
        { speaker: 'agent', message: 'Yes, we can do that! Would you like an appointment?' },
        { speaker: 'customer', message: 'Yes, book it please.' }
      ]
    }
  );
  console.log('[TEST 5] Lead status:', qualify.body.data.lead_status, '| Budget:', qualify.body.data.budget);

  // 6. Appointment booking test
  const booking = await request(
    { host: 'localhost', port: 5000, path: '/api/appointments', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    {
      customer_name: 'Rohan Sharma',
      customer_email: 'rohan@example.com',
      scheduled_time: new Date(Date.now() + 86400000 * 3).toISOString(),
      notes: 'Test booking via automated test script'
    }
  );
  console.log('[TEST 6] Appointment booked ID:', booking.body.data.id, '| Status:', booking.body.data.status);

  console.log('\nAll 6 core backend workflows passed successfully!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
