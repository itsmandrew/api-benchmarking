import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';

const healthTrend = new Trend('health_route');
const usersTrend = new Trend('users_route');
const loginTrend = new Trend('login_route');
const protectedTrend = new Trend('protected_route');

const BASE_URL = 'http://api:8000';

export const options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '30s', target: 10 },
        { duration: '10s', target: 0 },
    ],
};

export function setup() {
    // Login once before the test and return the token
    const res = http.post(`${BASE_URL}/login`, JSON.stringify({
        username: 'andrew',
        password: 'secret123',
    }), { headers: { 'Content-Type': 'application/json' } });

    return { token: res.json('access_token') };
}

export default function (data) {
    // 1. Health route - baseline
    const healthRes = http.get(`${BASE_URL}/health`);
    healthTrend.add(healthRes.timings.duration);
    check(healthRes, { 'health 200': (r) => r.status === 200 });

    // 2. DB query route
    const usersRes = http.get(`${BASE_URL}/users/2`);
    usersTrend.add(usersRes.timings.duration);
    check(usersRes, { 'users 200': (r) => r.status === 200 });

    // 3. Login route - bcrypt cost
    const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
        username: 'andrew',
        password: 'secret123',
    }), { headers: { 'Content-Type': 'application/json' } });
    loginTrend.add(loginRes.timings.duration);
    check(loginRes, { 'login 200': (r) => r.status === 200 });

    // 4. Protected route - JWT decode + DB lookup
    const protectedRes = http.get(`${BASE_URL}/protected`, {
        headers: { Authorization: `Bearer ${data.token}` },
    });
    protectedTrend.add(protectedRes.timings.duration);
    check(protectedRes, { 'protected 200': (r) => r.status === 200 });

    sleep(1);
}

