"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullableDateTransformer = void 0;
exports.NullableDateTransformer = {
    to: (value) => {
        if (value == null)
            return null;
        if (value instanceof Date)
            return value;
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    },
    from: (value) => {
        if (value == null)
            return null;
        const d = value instanceof Date ? value : new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }
};
