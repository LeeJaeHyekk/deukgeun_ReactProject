import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from '../store'

interface ReduxProviderProps {
  children: ReactNode
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store} data-testid="redux-provider">{children}</Provider>
}
