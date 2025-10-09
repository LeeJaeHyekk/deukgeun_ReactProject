import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@frontend/shared/contexts/AuthContext'
import { WorkoutTimerProvider } from '@frontend/shared/contexts/WorkoutTimerContext'
import { mockUser, mockToken } from './testSetup'

// Mock AuthContext values
const mockAuthContextValue = {
  isAuthenticated: true,
  user: mockUser,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
  checkAuthStatus: vi.fn().mockResolvedValue(true),
}

// Mock WorkoutTimerContext values
const mockWorkoutTimerContextValue = {
  isTimerActive: false,
  currentSession: null,
  startTimer: vi.fn(),
  pauseTimer: vi.fn(),
  stopTimer: vi.fn(),
  resetTimer: vi.fn(),
  elapsedTime: 0,
  formattedTime: '00:00:00',
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  isAuthenticated?: boolean
  user?: typeof mockUser | null
  isLoading?: boolean
  initialEntries?: string[]
}

function AllTheProviders({ 
  children, 
  isAuthenticated = true, 
  user = mockUser, 
  isLoading = false,
  initialEntries = ['/']
}: { 
  children: React.ReactNode
  isAuthenticated?: boolean
  user?: typeof mockUser | null
  isLoading?: boolean
  initialEntries?: string[]
}) {
  const authValue = {
    ...mockAuthContextValue,
    isAuthenticated,
    user,
    isLoading,
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkoutTimerProvider>
          {children}
        </WorkoutTimerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    isAuthenticated = true,
    user = mockUser,
    isLoading = false,
    initialEntries = ['/'],
    ...renderOptions
  } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        isAuthenticated={isAuthenticated}
        user={user}
        isLoading={isLoading}
        initialEntries={initialEntries}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'
module.exports.render = customRender

// Test data factories
const createMockUser = (overrides: Partial<typeof mockUser> = {}) => ({
  ...mockUser,
  ...overrides,
})

const createMockWorkoutPlan = (overrides: any = {}) => ({
  id: 'test-plan-id',
  name: 'Test Workout Plan',
  description: 'A test workout plan',
  exercises: [],
  duration: 60,
  difficulty: 'beginner',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

const createMockWorkoutSession = (overrides: any = {}) => ({
  id: 'test-session-id',
  planId: 'test-plan-id',
  userId: 'test-user-id',
  startTime: new Date('2024-01-01T10:00:00Z'),
  endTime: null,
  exercises: [],
  notes: '',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

const createMockWorkoutGoal = (overrides: any = {}) => ({
  id: 'test-goal-id',
  userId: 'test-user-id',
  title: 'Test Goal',
  description: 'A test workout goal',
  targetValue: 100,
  currentValue: 0,
  unit: 'reps',
  deadline: new Date('2024-12-31'),
  isCompleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

const createMockMachine = (overrides: any = {}) => ({
  id: 'test-machine-id',
  name: 'Test Machine',
  description: 'A test exercise machine',
  category: 'strength',
  difficulty: 'beginner',
  instructions: ['Step 1', 'Step 2'],
  tips: ['Tip 1', 'Tip 2'],
  imageUrl: '/images/test-machine.jpg',
  videoUrl: '/videos/test-machine.mp4',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

const createMockGym = (overrides: any = {}) => ({
  id: 'test-gym-id',
  name: 'Test Gym',
  address: '123 Test Street, Test City',
  phone: '010-1234-5678',
  latitude: 37.5665,
  longitude: 126.9780,
  rating: 4.5,
  price: 50000,
  facilities: ['헬스장', '수영장', '사우나'],
  operatingHours: '06:00-24:00',
  images: ['/images/gym1.jpg', '/images/gym2.jpg'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

const createMockCommunityPost = (overrides: any = {}) => ({
  id: 'test-post-id',
  userId: 'test-user-id',
  title: 'Test Post',
  content: 'This is a test post content',
  category: 'workout',
  tags: ['test', 'workout'],
  likes: 0,
  comments: 0,
  views: 0,
  isPublished: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

// Mock API responses
const mockApiResponses = {
  success: <T>(data: T) => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  }),
  
  error: (message: string, status = 500) => {
    const error = new Error(message)
    ;(error as any).response = {
      data: { message },
      status,
      statusText: 'Internal Server Error',
      headers: {},
      config: {},
    }
    return error
  },
  
  validationError: (errors: Record<string, string[]>) => {
    const error = new Error('Validation failed')
    ;(error as any).response = {
      data: { errors },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {},
    }
    return error
  },
}

// Wait for async operations
const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock router navigation
const mockNavigate = vi.fn()
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'test-key',
}

// Mock router
const mockRouter = {
  navigate: mockNavigate,
  location: mockLocation,
  params: {},
  query: {},
}

// Test helpers
const expectToBeInTheDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument()
}

const expectNotToBeInTheDocument = (element: HTMLElement | null) => {
  expect(element).not.toBeInTheDocument()
}

const expectToHaveTextContent = (element: HTMLElement | null, text: string) => {
  expect(element).toHaveTextContent(text)
}

const expectToHaveClass = (element: HTMLElement | null, className: string) => {
  expect(element).toHaveClass(className)
}

const expectToHaveAttribute = (element: HTMLElement | null, attribute: string, value?: string) => {
  if (value) {
    expect(element).toHaveAttribute(attribute, value)
  } else {
    expect(element).toHaveAttribute(attribute)
  }
}