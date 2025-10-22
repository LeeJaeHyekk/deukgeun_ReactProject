"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigIntNumberTransformer = void 0;
exports.BigIntNumberTransformer = {
    to: (value) => (value == null ? null : String(value)),
    from: (value) => (value == null ? null : Number(value))
};
