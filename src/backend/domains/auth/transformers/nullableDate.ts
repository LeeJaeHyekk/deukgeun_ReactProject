// ============================================================================
// Nullable Date Transformer
// ============================================================================

import { ValueTransformer } from "typeorm"

export const NullableDateTransformer: ValueTransformer = {
  to: (value: Date | null): Date | null => value,
  from: (value: string | null): Date | null => (value ? new Date(value) : null),
}
