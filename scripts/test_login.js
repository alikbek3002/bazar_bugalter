// Native fetch is available in Node 22

async function testHealth() {
    console.log('Testing health check...');
    try {
        const response = await fetch('http://localhost:3002/api/health');
        const json = await response.json();
        console.log('Health check:', json);
        return true;
    } catch (error) {
        console.error('Health check ERROR:', error);
        return false;
    }
}

async function testLogin() {
    const healthy = await testHealth();
    if (!healthy) {
        console.log('Skipping login test due to health check failure');
        return;
    }

    console.log('Testing login...');
    try {
        const response = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'owner@bazar.kg',
                password: 'owner'
            })
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Body:', text);

        if (response.ok) {
            const json = JSON.parse(text);
            if (json.success) {
                console.log('Login SUCCESS! Token:', json.data.token);
                // Now test a protected route
                testProtectedRoute(json.data.token);
            } else {
                console.log('Login FAILED (logic):', json.error);
            }
        } else {
            console.log('Login FAILED (http):', response.statusText);
        }

    } catch (error) {
        console.error('Login ERROR (network):', error);
    }
}

async function testProtectedRoute(token) {
    console.log('\nTesting protected route /api/stats/overview...');
    try {
        const response = await fetch('http://localhost:3001/api/stats/overview', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Body:', text.substring(0, 200) + '...');
    } catch (error) {
        console.error('Protected route error:', error);
    }
}

testLogin();
