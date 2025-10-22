"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailablePort = getAvailablePort;
const net_1 = __importDefault(require("net"));
async function getAvailablePort(defaultPort) {
    return new Promise(resolve => {
        const server = net_1.default.createServer();
        server.once("error", () => {
            resolve(defaultPort + 1);
        });
        server.once("listening", () => {
            server.close();
            resolve(defaultPort);
        });
        server.listen(defaultPort);
    });
}
