import React from 'react';

export default function ModernTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
              ${isActive 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
