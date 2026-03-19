const http = require('http');

const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

(async () => {
  try {
    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'tam@gmail.com', password: '123456' });

    const token = loginResult.data.data.token;
    console.log('Token:', token.substring(0, 20) + '...');

    const updateResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/orders/22/status',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    }, { status: 'confirmed' });

    console.log('Update response:', updateResult);
  } catch (err) {
    console.error('Error:', err);
  }
})();