import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@frontend/shared/utils/testUtils'
import Button from './Button'

describe('Button', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('버튼이 올바르게 렌더링된다', () => {
      render(<Button>테스트 버튼</Button>)

      expect(
        screen.getByRole('button', { name: '테스트 버튼' })
      ).toBeInTheDocument()
    })

    it('기본 props가 올바르게 적용된다', () => {
      render(<Button>기본 버튼</Button>)

      const button = screen.getByRole('button', { name: '기본 버튼' })
      expect(button).toHaveClass('btn')
      expect(button).toHaveClass('btn-primary')
      expect(button).toHaveClass('btn-md')
      expect(button).toHaveAttribute('type', 'button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('variants', () => {
    it('primary variant가 올바르게 적용된다', () => {
      render(<Button variant="primary">Primary</Button>)

      const button = screen.getByRole('button', { name: 'Primary' })
      expect(button).toHaveClass('btn-primary')
    })

    it('secondary variant가 올바르게 적용된다', () => {
      render(<Button variant="secondary">Secondary</Button>)

      const button = screen.getByRole('button', { name: 'Secondary' })
      expect(button).toHaveClass('btn-secondary')
    })

    it('danger variant가 올바르게 적용된다', () => {
      render(<Button variant="danger">Danger</Button>)

      const button = screen.getByRole('button', { name: 'Danger' })
      expect(button).toHaveClass('btn-danger')
    })

    it('ghost variant가 올바르게 적용된다', () => {
      render(<Button variant="ghost">Ghost</Button>)

      const button = screen.getByRole('button', { name: 'Ghost' })
      expect(button).toHaveClass('btn-ghost')
    })

    it('success variant가 올바르게 적용된다', () => {
      render(<Button variant="success">Success</Button>)

      const button = screen.getByRole('button', { name: 'Success' })
      expect(button).toHaveClass('btn-success')
    })
  })

  describe('sizes', () => {
    it('sm size가 올바르게 적용된다', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button', { name: 'Small' })
      expect(button).toHaveClass('btn-sm')
    })

    it('md size가 올바르게 적용된다', () => {
      render(<Button size="md">Medium</Button>)

      const button = screen.getByRole('button', { name: 'Medium' })
      expect(button).toHaveClass('btn-md')
    })

    it('lg size가 올바르게 적용된다', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button', { name: 'Large' })
      expect(button).toHaveClass('btn-lg')
    })

    it('small size가 올바르게 적용된다', () => {
      render(<Button size="small">Small</Button>)

      const button = screen.getByRole('button', { name: 'Small' })
      expect(button).toHaveClass('btn-small')
    })

    it('medium size가 올바르게 적용된다', () => {
      render(<Button size="medium">Medium</Button>)

      const button = screen.getByRole('button', { name: 'Medium' })
      expect(button).toHaveClass('btn-medium')
    })

    it('large size가 올바르게 적용된다', () => {
      render(<Button size="large">Large</Button>)

      const button = screen.getByRole('button', { name: 'Large' })
      expect(button).toHaveClass('btn-large')
    })
  })

  describe('상태', () => {
    it('disabled 상태가 올바르게 적용된다', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button', { name: 'Disabled' })
      expect(button).toBeDisabled()
      expect(button).toHaveClass('btn-disabled')
    })

    it('loading 상태가 올바르게 적용된다', () => {
      render(<Button loading>Loading</Button>)

      const button = screen.getByRole('button', { name: '로딩 중...' })
      expect(button).toBeDisabled()
      expect(button).toHaveClass('btn-disabled')
      expect(button).toHaveTextContent('로딩 중...')
    })

    it('loading 상태에서 children이 표시되지 않는다', () => {
      render(<Button loading>원본 텍스트</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('로딩 중...')
      expect(button).not.toHaveTextContent('원본 텍스트')
    })
  })

  describe('타입', () => {
    it('submit 타입이 올바르게 적용된다', () => {
      render(<Button type="submit">Submit</Button>)

      const button = screen.getByRole('button', { name: 'Submit' })
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('reset 타입이 올바르게 적용된다', () => {
      render(<Button type="reset">Reset</Button>)

      const button = screen.getByRole('button', { name: 'Reset' })
      expect(button).toHaveAttribute('type', 'reset')
    })

    it('button 타입이 올바르게 적용된다', () => {
      render(<Button type="button">Button</Button>)

      const button = screen.getByRole('button', { name: 'Button' })
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  describe('사용자 상호작용', () => {
    it('클릭 시 onClick 콜백이 호출된다', async () => {
      const mockOnClick = vi.fn()
      render(<Button onClick={mockOnClick}>Clickable</Button>)

      const button = screen.getByRole('button', { name: 'Clickable' })
      await user.click(button)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('disabled 상태에서는 클릭이 무시된다', async () => {
      const mockOnClick = vi.fn()
      render(
        <Button onClick={mockOnClick} disabled>
          Disabled
        </Button>
      )

      const button = screen.getByRole('button', { name: 'Disabled' })
      await user.click(button)

      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('loading 상태에서는 클릭이 무시된다', async () => {
      const mockOnClick = vi.fn()
      render(
        <Button onClick={mockOnClick} loading>
          Loading
        </Button>
      )

      const button = screen.getByRole('button', { name: '로딩 중...' })
      await user.click(button)

      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('키보드로 활성화할 수 있다', async () => {
      const mockOnClick = vi.fn()
      render(<Button onClick={mockOnClick}>Keyboard</Button>)

      const button = screen.getByRole('button', { name: 'Keyboard' })
      button.focus()
      await user.keyboard('{Enter}')

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('Space 키로도 활성화할 수 있다', async () => {
      const mockOnClick = vi.fn()
      render(<Button onClick={mockOnClick}>Space</Button>)

      const button = screen.getByRole('button', { name: 'Space' })
      button.focus()
      await user.keyboard(' ')

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('스타일링', () => {
    it('커스텀 className이 적용된다', () => {
      render(<Button className="custom-class">Custom</Button>)

      const button = screen.getByRole('button', { name: 'Custom' })
      expect(button).toHaveClass('custom-class')
    })

    it('커스텀 style이 적용된다', () => {
      const customStyle = { backgroundColor: 'red', color: 'white' }
      render(<Button style={customStyle}>Styled</Button>)

      const button = screen.getByRole('button', { name: 'Styled' })
      expect(button).toHaveStyle('background-color: red')
      expect(button).toHaveStyle('color: white')
    })

    it('여러 className이 올바르게 결합된다', () => {
      render(
        <Button className="custom-class another-class" variant="secondary">
          Multiple Classes
        </Button>
      )

      const button = screen.getByRole('button', { name: 'Multiple Classes' })
      expect(button).toHaveClass('btn')
      expect(button).toHaveClass('btn-secondary')
      expect(button).toHaveClass('btn-md')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('another-class')
    })
  })

  describe('접근성', () => {
    it('버튼 역할을 가진다', () => {
      render(<Button>Accessible</Button>)

      const button = screen.getByRole('button', { name: 'Accessible' })
      expect(button).toBeInTheDocument()
    })

    it('포커스 가능하다', () => {
      render(<Button>Focusable</Button>)

      const button = screen.getByRole('button', { name: 'Focusable' })
      button.focus()
      expect(button).toHaveFocus()
    })

    it('disabled 상태에서 포커스할 수 없다', () => {
      render(<Button disabled>Not Focusable</Button>)

      const button = screen.getByRole('button', { name: 'Not Focusable' })
      expect(button).toBeDisabled()
    })
  })

  describe('복잡한 children', () => {
    it('React 요소를 children으로 받을 수 있다', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Icon')
      expect(button).toHaveTextContent('Text')
    })

    it('여러 텍스트 노드를 children으로 받을 수 있다', () => {
      render(
        <Button>
          {'Hello'} {'World'}
        </Button>
      )

      const button = screen.getByRole('button', { name: 'Hello World' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('이벤트 처리', () => {
    it('onClick이 undefined여도 에러가 발생하지 않는다', async () => {
      render(<Button>No Click</Button>)

      const button = screen.getByRole('button', { name: 'No Click' })
      await expect(user.click(button)).resolves.not.toThrow()
    })

    it('이벤트 객체가 올바르게 전달된다', async () => {
      const mockOnClick = vi.fn()
      render(<Button onClick={mockOnClick}>Event Test</Button>)

      const button = screen.getByRole('button', { name: 'Event Test' })
      fireEvent.click(button)

      expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object))
    })
  })
})
