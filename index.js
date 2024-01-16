const express = require('express');
const fs = require('fs');
const https = require('node:https');
const cors = require('cors');

const REPORTING_ENDPOINT_BASE = 'https://localhost:8443';
const REPORTING_ENDPOINT_MAIN = `${REPORTING_ENDPOINT_BASE}/main`;
const REPORTING_ENDPOINT_DEFAULT = `${REPORTING_ENDPOINT_BASE}/custom`;

let credentials;
if (process.env.NODE_ENV === 'development') {
    const privateKey = fs.readFileSync('sslcert/server.key', { encoding: 'utf8' });
    const certificate = fs.readFileSync('sslcert/server.cert', { encoding: 'utf8' });
    if (privateKey && certificate) {
        credentials = { key: privateKey, cert: certificate, rejectUnauthorized: false, requestCert: false };
    } else {
        throw new Error('Missing private key or certificate.');
    }
}

const corsOptions = {
    origin: 'https://localhost:8443'
};

const app = express();
app.use(cors(corsOptions))
app.use(express.json({ type: ['application/json', 'application/reports+json'] }));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.set(
        'Reporting-Endpoints',
        `main-endpoint="${REPORTING_ENDPOINT_MAIN}", default="${REPORTING_ENDPOINT_DEFAULT}"`
    );
    res.set(
        'Document-Policy',
        `document-write=?0, js-profiling, include-js-call-stacks-in-crash-reports; report-to=main-endpoint`
    );
    //set Cross-Origin-Resource-Policy
    res.set('Cross-Origin-Opener-Policy', 'same-origin');
    // This allows us to only load resources that are explicitly marked as sharable.
    res.set('Cross-Origin-Embedder-Policy', 'require-corp');
    // res.set(
    //     'Cross-Origin-Resource-Policy',
    //     `same-origin; report-to=main-endpoint`
    // )
    next();
})

app.use('/', express.static('public'));

app.post('/main', async (req, res) => {
    console.log('main Received a report: ');
    res.set('Content-Type', 'application/json');
    res.send({ message: 'Successfully received a crash report' });
});

app.post('/custom', async (req, res) => {
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

let httpsServer;
if (process.env.NODE_ENV === 'development') {
    httpsServer = https.createServer(credentials, app);
}

app.listen(8080, () => {
    console.log('Server listening on port 8080');
});

if (process.env.NODE_ENV === 'development') {
    httpsServer.listen(8443, () => {
        console.log('Server listening on port 8443');
    });
}
