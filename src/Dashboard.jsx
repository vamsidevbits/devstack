import React, { useState, useEffect } from 'react';
import { useTheme } from './context/ThemeContext';
import { Moon, Sun, Code, Key, Home, Hash, FileText, Shield, Award, GitCompare, Clock, Search, Smartphone, BookOpen } from 'lucide-react';
import ModernTabs from './components/ModernTabs';
import HomeView from './components/HomeView';
import UnifiedJWTCreator from './components/UnifiedJWTCreator';
import UUIDGenerator from './components/UUIDGenerator';
import Base64Tool from './components/Base64Tool';
import JSONLint from './components/JSONLint';
import KeyGenerator from './components/KeyGenerator';
import CertificateUtility from './components/CertificateUtility';
import HashGenerator from './components/HashGenerator';
import TextDiffTool from './components/TextDiffTool';
import TimestampConverter from './components/TimestampConverter';
import RegexTester from './components/RegexTester';
import TOTPGenerator from './components/TOTPGenerator';
import SwaggerPreview from './components/SwaggerPreview';

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, component: HomeView },
    { id: 'jwt', label: 'JWT', icon: Key, component: UnifiedJWTCreator },
    { id: 'hash', label: 'Hash', icon: Hash, component: HashGenerator },
    { id: 'diff', label: 'Diff', icon: GitCompare, component: TextDiffTool },
    { id: 'timestamp', label: 'Timestamp', icon: Clock, component: TimestampConverter },
    { id: 'uuid', label: 'UUID', icon: Hash, component: UUIDGenerator },
    { id: 'base64', label: 'Base64', icon: Code, component: Base64Tool },
    { id: 'jsonlint', label: 'JSONLint', icon: FileText, component: JSONLint },
    { id: 'keygen', label: 'Key Generator', icon: Shield, component: KeyGenerator },
    { id: 'cert', label: 'Certificate', icon: Award, component: CertificateUtility },
    { id: 'regex', label: 'Regex Tester', icon: Search, component: RegexTester },
    { id: 'totp', label: 'TOTP/2FA', icon: Smartphone, component: TOTPGenerator },
    { id: 'swagger', label: 'Swagger Preview', icon: BookOpen, component: SwaggerPreview }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || HomeView;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  DevStack
                </h1>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stack of developer tools
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ModernTabs
            tabs={tabs.map(tab => ({
              id: tab.id,
              label: tab.label,
              icon: tab.icon
            }))}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ActiveComponent />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>DevStack - Stack of developer tools</p>
            <p className="mt-1">
              Crafted with passion for developers by Vamsikrishna Patchava
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
