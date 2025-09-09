import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUserStore } from '../../shared/store/userStore'
import { useAuthContext } from '../../shared/contexts/AuthContext'
import { MENU_ITEMS, ROUTES, routeUtils } from '../../shared/constants/routes'
import { shouldShowAdminMenu } from '../../shared/utils/adminUtils'

export function Navigation() {
  const location = useLocation()
  const { user } = useUserStore()
  const { isLoggedIn } = useAuthContext()

  const isActivePage = (path: string) => {
    return routeUtils.isActiveRoute(location.pathname, path)
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={ROUTES.HOME} className="text-xl font-bold text-blue-600">
                헬스장 찾기
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {MENU_ITEMS.map((item) => {
                // 로그인이 필요한 메뉴는 로그인 상태에서만 표시
                if (!item.public && !isLoggedIn) return null
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                      ${isActivePage(item.path)
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                {shouldShowAdminMenu(user?.role || '') && (
                  <Link
                    to={ROUTES.DASHBOARD}
                    className={`
                      text-sm font-medium px-3 py-2 rounded-md
                      ${isActivePage(ROUTES.DASHBOARD)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    관리자
                  </Link>
                )}
                <Link
                  to={ROUTES.MYPAGE}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  마이페이지
                </Link>
                <span className="text-sm text-gray-500">
                  {user?.name || '사용자'}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to={ROUTES.LOGIN}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  로그인
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
