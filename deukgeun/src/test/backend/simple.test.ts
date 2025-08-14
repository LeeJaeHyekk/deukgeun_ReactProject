import { testDataSource } from "./setup"

describe("Simple Backend Test", () => {
  it("should have access to process.env", () => {
    expect(process.env.NODE_ENV).toBe("test")
    expect(process.env.DB_HOST).toBe("localhost")
    expect(process.env.JWT_SECRET).toBe("test-secret-key")
  })

  it("should have testDataSource available", () => {
    expect(testDataSource).toBeDefined()
    expect(typeof testDataSource.initialize).toBe("function")
  })

  it("should be able to access Node.js globals", () => {
    expect(process).toBeDefined()
    expect(global).toBeDefined()
    expect(Buffer).toBeDefined()
  })
})
