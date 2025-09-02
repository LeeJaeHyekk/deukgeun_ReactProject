import { describe, it, expect } from "@jest/globals"

describe("Basic ESM Test", () => {
  it("should work with ESM imports", () => {
    expect(1 + 1).toBe(2)
  })

  it("should support dynamic imports", async () => {
    const path = await import("path")
    expect(path).toBeDefined()
  })
})

describe("Backend Configuration", () => {
  it("should have proper environment setup", () => {
    expect(process.env.NODE_ENV || "development").toBeDefined()
  })
})
