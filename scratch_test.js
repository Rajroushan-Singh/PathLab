const API_BASE_URL = 'https://39bc-116-73-95-165.ngrok-free.app/api/v1';

async function test() {
  console.log('1. Trying to login...');
  const loginRes = await fetch(`${API_BASE_URL}/auth/lab/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '+918087209688',
      password: 'labpassword123'
    })
  });
  
  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.text());
    return;
  }
  
  const loginData = await loginRes.json();
  const token = loginData.access;
  console.log('Login successful! Token:', token.substring(0, 20) + '...');
  
  console.log('\n2. Testing getConsents...');
  const consentListRes = await fetch(`${API_BASE_URL}/lab/consent/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': '69420'
    }
  });
  console.log('getConsents Status:', consentListRes.status);
  console.log('getConsents Response:', await consentListRes.text());

  console.log('\n3. Testing requestConsent (Create Request)...');
  const requestConsentRes = await fetch(`${API_BASE_URL}/lab/consent/request/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420'
    },
    body: JSON.stringify({
      user_phone: '+918087209688',
      description: 'Test consent request purpose'
    })
  });
  console.log('requestConsent Status:', requestConsentRes.status);
  console.log('requestConsent Response:', await requestConsentRes.text());
}

test().catch(err => console.error('Error:', err));
