// Global Error Handler
import React from 'react'

export const reportError = (error: Error, context?: any) => {
  console.error('Global error reported:', error, context)
}

export const getErrorHistory = () => {
  return []
}

export const clearErrorHistory = () => {
  console.log('Error history cleared')
}

export const showErrorNotification = (message: string, type: string) => {
  console.log('Error notification:', message, type)
}

const globalErrorHandler = {
  reportError,
  getErrorHistory,
  clearErrorHistory,
  showErrorNotification,
  manualErrorReport: (error: Error, context?: any) => {
    console.error('Manual error report:', error, context)
  }
}

export default globalErrorHandler
