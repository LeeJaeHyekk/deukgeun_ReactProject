import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@frontend/shared/utils/testUtils'
import GymFinderPage from './GymFinderPage'

// Mock dependencies
vi.mock('@frontend/shared/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      nickname: 'Test User',
    },
    isLoggedIn: true,
    login: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  }),
}))

vi.mock('./hooks/useGymSearch', () => ({
  useGymSearch: () => ({
    gyms: [
      {
        id: '1',
        name: 'Test Gym 1',
        address: 'Test Address 1',
        phone: '010-1234-5678',
        category: '헬스장',
        distance: '100m',
        placeUrl: 'https://place.map.kakao.com/1',
        x: '126.978',
        y: '37.5665',
      },
      {
        id: '2',
        name: 'Test Gym 2',
        address: 'Test Address 2',
        phone: '010-8765-4321',
        category: '헬스장',
        distance: '200m',
        placeUrl: 'https://place.map.kakao.com/2',
        x: '126.979',
        y: '37.5666',
      },
    ],
    loading: false,
    error: null,
    searchGyms: vi.fn(),
    clearResults: vi.fn(),
    hasSearched: true,
  }),
}))

vi.mock('./hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    position: {
      latitude: 37.5665,
      longitude: 126.978,
    },
    error: null,
    isLoading: false,
    getCurrentPosition: vi.fn(),
  }),
}))

describe('GymFinderPage', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('렌더링', () => {
    it('헬스장 찾기 페이지가 올바르게 렌더링된다', () => {
      render(<GymFinderPage />)

      expect(screen.getByText('헬스장 찾기')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('헬스장 이름을 입력하세요')
      ).toBeInTheDocument()
    })

    it('검색 결과가 올바르게 표시된다', () => {
      render(<GymFinderPage />)

      expect(screen.getByText('Test Gym 1')).toBeInTheDocument()
      expect(screen.getByText('Test Gym 2')).toBeInTheDocument()
      expect(screen.getByText('Test Address 1')).toBeInTheDocument()
      expect(screen.getByText('Test Address 2')).toBeInTheDocument()
    })

    it('검색 버튼이 표시된다', () => {
      render(<GymFinderPage />)

      expect(screen.getByText('검색')).toBeInTheDocument()
    })
  })

  describe('검색 기능', () => {
    it('검색어 입력 시 검색이 실행된다', async () => {
      const mockSearchGyms = vi.fn()

      vi.mocked(require('./hooks/useGymSearch').useGymSearch).mockReturnValue({
        gyms: [],
        loading: false,
        error: null,
        searchGyms: mockSearchGyms,
        clearResults: vi.fn(),
        hasSearched: false,
      })

      render(<GymFinderPage />)

      const searchInput =
        screen.getByPlaceholderText('헬스장 이름을 입력하세요')
      await user.type(searchInput, '헬스장')

      const searchButton = screen.getByText('검색')
      await user.click(searchButton)

      expect(mockSearchGyms).toHaveBeenCalledWith('헬스장')
    })

    it('엔터 키로 검색이 실행된다', async () => {
      const mockSearchGyms = vi.fn()

      vi.mocked(require('./hooks/useGymSearch').useGymSearch).mockReturnValue({
        gyms: [],
        loading: false,
        error: null,
        searchGyms: mockSearchGyms,
        clearResults: vi.fn(),
        hasSearched: false,
      })

      render(<GymFinderPage />)

      const searchInput =
        screen.getByPlaceholderText('헬스장 이름을 입력하세요')
      await user.type(searchInput, '헬스장')
      await user.keyboard('{Enter}')

      expect(mockSearchGyms).toHaveBeenCalledWith('헬스장')
    })

    it('빈 검색어로 검색 시 결과가 초기화된다', async () => {
      const mockClearResults = vi.fn()

      vi.mocked(require('./hooks/useGymSearch').useGymSearch).mockReturnValue({
        gyms: [],
        loading: false,
        error: null,
        searchGyms: vi.fn(),
        clearResults: mockClearResults,
        hasSearched: true,
      })

      render(<GymFinderPage />)

      const searchInput =
        screen.getByPlaceholderText('헬스장 이름을 입력하세요')
      await user.clear(searchInput)

      const searchButton = screen.getByText('검색')
      await user.click(searchButton)

      expect(mockClearResults).toHaveBeenCalled()
    })
  })

  describe('검색 결과', () => {
    it('헬스장 카드가 올바르게 렌더링된다', () => {
      render(<GymFinderPage />)

      const gymCards = screen.getAllByTestId('gym-card')
      expect(gymCards).toHaveLength(2)

      expect(screen.getByText('Test Gym 1')).toBeInTheDocument()
      expect(screen.getByText('Test Address 1')).toBeInTheDocument()
      expect(screen.getByText('010-1234-5678')).toBeInTheDocument()
      expect(screen.getByText('100m')).toBeInTheDocument()
    })

    it('헬스장 카드 클릭 시 상세 정보가 표시된다', async () => {
      render(<GymFinderPage />)

      const gymCard = screen.getByText('Test Gym 1')
      await user.click(gymCard)

      expect(screen.getByText('헬스장 상세 정보')).toBeInTheDocument()
      expect(screen.getByText('Test Gym 1')).toBeInTheDocument()
    })

    it('길찾기 버튼 클릭 시 지도 앱이 열린다', async () => {
      // window.open 모킹
      const mockOpen = vi.fn()
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      })

      render(<GymFinderPage />)

      const directionsButton = screen.getAllByText('길찾기')[0]
      await user.click(directionsButton)

      expect(mockOpen).toHaveBeenCalledWith(
        'https://place.map.kakao.com/1',
        '_blank'
      )
    })

    it('전화 걸기 버튼 클릭 시 전화 앱이 열린다', async () => {
      render(<GymFinderPage />)

      const callButton = screen.getAllByText('전화걸기')[0]
      await user.click(callButton)

      // 전화 링크가 생성되었는지 확인
      expect(callButton.closest('a')).toHaveAttribute(
        'href',
        'tel:010-1234-5678'
      )
    })
  })

  describe('로딩 상태', () => {
    it('검색 중일 때 로딩 스피너가 표시된다', () => {
      vi.mocked(require('./hooks/useGymSearch').useGymSearch).mockReturnValue({
        gyms: [],
        loading: true,
        error: null,
        searchGyms: vi.fn(),
        clearResults: vi.fn(),
        hasSearched: false,
      })

      render(<GymFinderPage />)

      expect(screen.getByText('검색 중...')).toBeInTheDocument()
    })
  })

  describe('에러 상태', () => {
    it('검색 에러 발생 시 에러 메시지가 표시된다', () => {
      vi.mocked(require('./hooks/useGymSearch').useGymSearch).mockReturnValue({
        gyms: [],
        loading: false,
        error: '검색 중 오류가 발생했습니다.',
        searchGyms: vi.fn(),
        clearResults: vi.fn(),
        hasSearched: true,
      })

      render(<GymFinderPage />)

      expect(
        screen.getByText('검색 중 오류가 발생했습니다.')
      ).toBeInTheDocument()
    })

    it('위치 정보 에러 발생 시 에러 메시지가 표시된다', () => {
      vi.mocked(
        require('./hooks/useGeolocation').useGeolocation
      ).mockReturnValue({
        position: null,
        error: '위치 정보를 가져올 수 없습니다.',
        isLoading: false,
        getCurrentPosition: vi.fn(),
      })

      render(<GymFinderPage />)

      expect(
        screen.getByText('위치 정보를 가져올 수 없습니다.')
      ).toBeInTheDocument()
    })
  })

  describe('빈 상태', () => {
    it('검색 결과가 없을 때 적절한 메시지가 표시된다', () => {
      vi.mocked(require('./hooks/useGymSearch').useGymSearch).mockReturnValue({
        gyms: [],
        loading: false,
        error: null,
        searchGyms: vi.fn(),
        clearResults: vi.fn(),
        hasSearched: true,
      })

      render(<GymFinderPage />)

      expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument()
      expect(
        screen.getByText('다른 검색어로 시도해보세요.')
      ).toBeInTheDocument()
    })

    it('아직 검색하지 않았을 때 안내 메시지가 표시된다', () => {
      vi.mocked(require('./hooks/useGymSearch').useGymSearch).mockReturnValue({
        gyms: [],
        loading: false,
        error: null,
        searchGyms: vi.fn(),
        clearResults: vi.fn(),
        hasSearched: false,
      })

      render(<GymFinderPage />)

      expect(screen.getByText('헬스장을 검색해보세요!')).toBeInTheDocument()
    })
  })

  describe('위치 정보', () => {
    it('현재 위치 버튼 클릭 시 위치 정보를 가져온다', async () => {
      const mockGetCurrentPosition = vi.fn()

      vi.mocked(
        require('./hooks/useGeolocation').useGeolocation
      ).mockReturnValue({
        position: null,
        error: null,
        isLoading: false,
        getCurrentPosition: mockGetCurrentPosition,
      })

      render(<GymFinderPage />)

      const locationButton = screen.getByText('현재 위치')
      await user.click(locationButton)

      expect(mockGetCurrentPosition).toHaveBeenCalled()
    })

    it('위치 정보 로딩 중일 때 로딩 상태가 표시된다', () => {
      vi.mocked(
        require('./hooks/useGeolocation').useGeolocation
      ).mockReturnValue({
        position: null,
        error: null,
        isLoading: true,
        getCurrentPosition: vi.fn(),
      })

      render(<GymFinderPage />)

      expect(screen.getByText('위치 정보 가져오는 중...')).toBeInTheDocument()
    })
  })

  describe('접근성', () => {
    it('검색 입력 필드에 적절한 라벨이 있다', () => {
      render(<GymFinderPage />)

      const searchInput = screen.getByLabelText('헬스장 검색')
      expect(searchInput).toBeInTheDocument()
    })

    it('검색 버튼에 적절한 접근성 속성이 있다', () => {
      render(<GymFinderPage />)

      const searchButton = screen.getByRole('button', { name: '검색' })
      expect(searchButton).toBeInTheDocument()
    })

    it('키보드 네비게이션이 작동한다', async () => {
      render(<GymFinderPage />)

      const searchInput =
        screen.getByPlaceholderText('헬스장 이름을 입력하세요')
      await user.tab()

      expect(document.activeElement).toBe(searchInput)
    })
  })
})
