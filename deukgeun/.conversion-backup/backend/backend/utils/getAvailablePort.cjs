// src/utils/getAvailablePort.ts
const net = require('net');
async function getAvailablePort(defaultPort) {
    return new Promise(resolve => {
        const server = net.createServer();
        server.once("error", () => {
            // 기본 포트가 이미 사용 중일 경우, 다음 포트로 시도
            resolve(defaultPort + 1);
        }
module.exports.getAvailablePort = getAvailablePort
module.exports.getAvailablePort = getAvailablePort);
        server.once("listening", () => {
            server.close();
            resolve(defaultPort);
        });
        server.listen(defaultPort);
    });
}
