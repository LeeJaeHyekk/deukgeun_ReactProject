import { ValueTransformer } from 'typeorm';

// BIGINT <-> number (DB는 string 반환 가능) null-safe
export const BigIntNumberTransformer: ValueTransformer = {
  to: (value: number | null | undefined) => (value == null ? null : String(value)),
  from: (value: string | number | null) => (value == null ? null : Number(value))
};
