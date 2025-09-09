import React from 'react'

interface LevelDisplayProps {
  currentLevel: number
  currentExp: number
  maxExp: number
  showProgress?: boolean
  className?: string
}

export function LevelDisplay({ 
  currentLevel, 
  currentExp, 
  maxExp, 
  showProgress = true,
  className = "" 
}: LevelDisplayProps) {
  const progressPercentage = (currentExp / maxExp) * 100

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg font-bold text-blue-600">Lv.{currentLevel}</span>
        <span className="text-sm text-gray-500">
          {currentExp.toLocaleString()} / {maxExp.toLocaleString()} EXP
        </span>
      </div>
      
      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            {progressPercentage.toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  )
}