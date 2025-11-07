"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirname = getDirname;
exports.getFilename = getFilename;
exports.resolvePath = resolvePath;
exports.joinPath = joinPath;
const path_1 = __importDefault(require("path"));
function getDirname() {
    if (typeof __dirname !== 'undefined' && typeof global.__dirname === 'undefined') {
        return __dirname;
    }
    return process.cwd();
}
function getFilename() {
    if (typeof __filename !== 'undefined') {
        return __filename;
    }
    return process.cwd();
}
function resolvePath(...paths) {
    return path_1.default.resolve(...paths);
}
function joinPath(...paths) {
    return path_1.default.join(...paths);
}
