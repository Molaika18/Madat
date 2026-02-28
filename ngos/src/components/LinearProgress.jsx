"use client";
import React from 'react';

export default function LinearProgress({ 
  progress = 0,
  height = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  animated = true,
  showPercentage = false,
  rounded = true
}) {
  return (
    <div className="w-full">
      <div 
        className={`w-full overflow-hidden ${rounded ? 'rounded-full' : ''}`}
        style={{ 
          height: `${height}px`,
          backgroundColor 
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%',
            backgroundColor: color,
            transition: animated ? 'width 0.3s ease' : 'none',
          }}
        />
      </div>
      {showPercentage && (
        <div className="text-sm text-slate-600 mt-1 text-right">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}
