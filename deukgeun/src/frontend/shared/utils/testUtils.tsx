import { render, RenderOptions } from "@testing-library/react"
import { ReactElement } from "react"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "../../contexts/AuthContext"

// 테스트용 커스텀 렌더러
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options })

// 재내보내기
export * from "@testing-library/react"
export { customRender as render }
