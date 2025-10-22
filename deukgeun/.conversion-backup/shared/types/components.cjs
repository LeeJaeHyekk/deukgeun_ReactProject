// ============================================================================
// 공통 컴포넌트 Props 타입 정의
// ============================================================================

    options?: Array<{ value: any; label: string }>
  }>
}

// 정렬 Props
>
}

// 테이블 Props
>
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  selectable?: boolean
  selectedItems?: T[]
  onSelectionChange?: (items: T[]) => void
}

// 차트 Props

// 지도 Props

  zoom?: number
  markers?: Array<{
    lat: number
    lng: number
    title?: string
    onClick?: () => void
  }>
  onMapClick?: (lat: number, lng: number) => void
  loading?: boolean
}

// 캘린더 Props
>
  locale?: string
}

// 타이머 Props

// 아바타 Props

// 배지 Props

// 스켈레톤 Props

// 스피너 Props

// 토글 Props

// 슬라이더 Props
>
  range?: boolean
  valueLabelDisplay?: 'auto' | 'on' | 'off'
}

// 레이팅 Props

// 스텝 Props
>
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'dots' | 'numbers'
}

// 탭 패널 Props

// 액코디언 Props
>
  allowMultiple?: boolean
  onToggle?: (index: number) => void
}

// 캐러셀 Props

// 그리드 Props

// 플렉스 Props

// 스택 Props

// 박스 Props

// 컨테이너 Props

// 섹션 Props

// 헤더 Props

// 푸터 Props
>
  social?: Array<{
    name: string
    href: string
    icon: ReactNode
  }>
}

// 사이드바 Props

// 네비게이션 Props
>
  }>
  variant?: 'horizontal' | 'vertical'
  orientation?: 'left' | 'center' | 'right'
}

// 브레드크럼 Props
>
  separator?: ReactNode
  maxItems?: number
}

// 메뉴 Props
>
  }>
  variant?: 'default' | 'minimal' | 'pills'
  orientation?: 'horizontal' | 'vertical'
}

// 사이드바 메뉴 Props
>
  }>
  collapsed?: boolean
  onToggle?: () => void
}

// 컨텍스트 메뉴 Props
>
  trigger: ReactNode
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
}

// 팝오버 Props

// 모달 다이얼로그 Props

// 드로어 Props

// 백드롭 Props

// 포털 Props

// 트랜지션 Props

// 애니메이션 Props

// 스크롤 Props

// 가상화 Props

// 무한 스크롤 Props

// 지연 로딩 Props

// 인터섹션 옵저버 Props

// 리사이즈 옵저버 Props

// 뷰포트 Props
) => void
}

// 미디어 쿼리 Props

// 브레이크포인트 Props

// 반응형 Props

// 테마 Props

// 로케일 Props

// 접근성 Props

// 키보드 Props

// 마우스 Props

// 터치 Props

// 드래그 Props

// 포커스 Props

// 폼 Props

// 검증 Props
>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateOnSubmit?: boolean
}

// 상태 Props

// 생명주기 Props

// 성능 Props

// 디버깅 Props

// 테스트 Props

// 개발자 도구 Props

// 모든 Props를 결합한 유니온 타입