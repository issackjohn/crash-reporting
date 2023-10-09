const express = require('express');
const fs = require('fs');
const https = require('node:https');
const cors = require('cors');

const REPORTING_ENDPOINT_BASE = 'https://localhost:8443';
const REPORTING_ENDPOINT_MAIN = `${REPORTING_ENDPOINT_BASE}/main`;
const REPORTING_ENDPOINT_DEFAULT = `${REPORTING_ENDPOINT_BASE}/default`;

const privateKey = fs.readFileSync('sslcert/server.key', { encoding: 'utf8' });
const certificate = fs.readFileSync('sslcert/server.cert', { encoding: 'utf8' });

let credentials;

if (privateKey && certificate) {
    credentials = { key: privateKey, cert: certificate, rejectUnauthorized: false, requestCert: false};
} else {
    throw new Error('Missing private key or certificate.');
}

const app = express();
app.use(cors())
app.use(express.static('public'));
app.use(express.json({ type: ['application/json', 'application/reports+json'] }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.set(
        'Reporting-Endpoints',
        `main-endpoint="${REPORTING_ENDPOINT_MAIN}", default="${REPORTING_ENDPOINT_DEFAULT}"`
    );
    res.set(
        'Content-Security-Policy',
        `script-src 'self' 'unsafe-inline' 'unsafe-eval'; object-src 'none'; report-to main-endpoint;`
    );
    res.set(
        'Document-Policy',
        `document-write=?0; report-to=main-endpoint`
    );
    next();
})

app.get('/', (req, res) => {
    console.log('Serving html');
    res.sendFile('index.html');
});

app.post('/main', async (req, res) => {
    console.log('main Received a report: ');
    res.set('Content-Type', 'application/json');
    res.send({ message: 'Successfully received a crash report' });
});

app.post('/default', async (req, res) => {
    console.log('Default Received a report: ');

    for (let i = 0; i < req?.body?.length; i++) {
        console.log(req?.body[i]?.type);
        if (req?.body[i]?.type === 'crash') {
            console.log(req?.body[i]);
        }
    }

    res.set('Content-Type', 'application/json');
    res.send({ message: 'Successfully received a crash report' });
});

const httpsServer = https.createServer(credentials, app);

app.listen(8000, () => {
    console.log('Server listening on port 8000');
});

httpsServer.listen(8443, () => {
    console.log('Server listening on port 8443');
});
