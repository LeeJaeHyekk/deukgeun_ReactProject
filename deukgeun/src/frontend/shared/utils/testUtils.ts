import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

// 테스트용 커스텀 렌더러 (라우터 포함)
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock 데이터 생성 함수들
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  nickname: '테스트 사용자',
  role: 'user' as const,
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockMachine = (overrides = {}) => ({
  id: 1,
  machineKey: 'test-machine',
  name: '테스트 머신',
  nameEn: 'Test Machine',
  imageUrl: '/test-image.jpg',
  shortDesc: '테스트 머신 설명',
  detailDesc: '상세한 테스트 머신 설명',
  category: 'strength' as const,
  difficulty: 'beginner' as const,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockWorkoutGoal = (overrides = {}) => ({
  id: 1,
  userId: 1,
  title: '테스트 목표',
  description: '테스트 목표 설명',
  type: 'weight' as const,
  targetValue: 100,
  currentValue: 50,
  unit: 'kg',
  deadline: new Date('2024-12-31'),
  isCompleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockPost = (overrides = {}) => ({
  id: 1,
  title: '테스트 포스트',
  content: '테스트 포스트 내용',
  author: '테스트 작성자',
  userId: 1,
  category: '운동루틴' as const,
  like_count: 10,
  comment_count: 5,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockUserLevel = (overrides = {}) => ({
  id: 1,
  userId: 1,
  level: 5,
  currentExp: 1500,
  totalExp: 5000,
  seasonExp: 1000,
  totalLevelUps: 4,
  currentSeason: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// API Mock 함수들
export const mockApiResponse = <T>(data: T, delay = 100) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message = 'API Error', status = 500) => {
  return Promise.reject(new Error(message));
};

// 테스트용 이벤트 시뮬레이션
export const simulateUserInteraction = {
  click: (element: HTMLElement) => {
    element.click();
  },
  
  type: (element: HTMLInputElement, text: string) => {
    element.focus();
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },
  
  submit: (form: HTMLFormElement) => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  },
  
  scroll: (element: HTMLElement, scrollTop: number) => {
    element.scrollTop = scrollTop;
    element.dispatchEvent(new Event('scroll', { bubbles: true }));
  },
};

// 테스트용 유틸리티 함수들
export const waitForElementToBeRemoved = (element: HTMLElement) => {
  return new Promise<void>((resolve) => {
    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect();
        resolve();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

export const waitForCondition = (condition: () => boolean, timeout = 5000) => {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();
    
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Condition timeout'));
      } else {
        setTimeout(checkCondition, 100);
      }
    };
    
    checkCondition();
  });
};

// 테스트용 환경 설정
export const setupTestEnvironment = () => {
  // localStorage Mock
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // sessionStorage Mock
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });

  // fetch Mock
  global.fetch = jest.fn();

  // ResizeObserver Mock
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // IntersectionObserver Mock
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

// 테스트 정리 함수
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks();
  jest.clearAllTimers();
};

// 테스트용 스냅샷 비교
export const expectSnapshot = (component: ReactElement) => {
  const { container } = customRender(component);
  expect(container.firstChild).toMatchSnapshot();
};

// 재내보내기
export * from '@testing-library/react';
export { customRender as render };
