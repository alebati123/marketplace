const net = require('net');
const host = 'c2622096.ferozo.com';
const port = 3306;

console.log(`Testing connection to ${host}:${port}...`);
const socket = new net.Socket();
const timeout = 5000;

socket.setTimeout(timeout);

socket.on('connect', () => {
    console.log(`SUCCESS: Port ${port} is OPEN on ${host}`);
    socket.destroy();
});

socket.on('timeout', () => {
    console.log(`FAILED: Connection to ${host}:${port} timed out`);
    socket.destroy();
});

socket.on('error', (err) => {
    console.log(`FAILED: Port ${port} is CLOSED or unreachable on ${host} (${err.message})`);
    socket.destroy();
});

socket.connect(port, host);
