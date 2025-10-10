// Date <-> DB(date/timestamp) null-safe transformer (Phase 1: 보수적으로 null 허용)
const NullableDateTransformer
module.exports.NullableDateTransformer = NullableDateTransformer = {
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
