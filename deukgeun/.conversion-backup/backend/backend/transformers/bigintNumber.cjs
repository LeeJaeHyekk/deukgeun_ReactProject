// BIGINT <-> number (DB는 string 반환 가능) null-safe
const BigIntNumberTransformer
module.exports.BigIntNumberTransformer = BigIntNumberTransformer = {
    to: (value) => (value == null ? null : String(value)),
    from: (value) => (value == null ? null : Number(value))
};
