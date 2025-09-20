import React from 'react';
import { Key, Code, Hash, FileText, Github, ExternalLink, Shield, Award, GitCompare, Clock, Search, Smartphone, FileKey, Package, BookOpen } from 'lucide-react';

export default function HomeView() {
  const features = [
    {
      icon: Key,
      title: 'JWT Analyzer',
      description: 'Create, decode, validate, and analyze JWT tokens with comprehensive claim inspection and signature verification.',
      items: ['JWT Creation & Signing', 'Token Decoding & Analysis', 'HMAC & RSA Support', 'Algorithm Support (HS256-512, RS256-512, PS256-512)']
    },
    {
      icon: Hash,
      title: 'Hash Generator',
      description: 'Generate multiple hash values and encodings from text or files with various algorithms.',
      items: ['MD5, SHA-1, SHA-256/384/512', 'BLAKE2B, CRC32 Checksums', 'Base64/Base64URL Encoding', 'File Upload Support']
    },
    {
      icon: GitCompare,
      title: 'Text Diff & Compare',
      description: 'Compare two texts side-by-side with highlighted differences and detailed analysis.',
      items: ['Side-by-Side Comparison', 'Highlighted Differences', 'Ignore Case Option', 'Whitespace Visualization']
    },
    {
      icon: Clock,
      title: 'Timestamp Converter',
      description: 'Convert between Unix timestamps and human-readable dates with multiple format support.',
      items: ['Unix to Human Date', 'Multiple Date Formats', 'Timezone Support', 'Relative Time Display']
    },
    {
      icon: Shield,
      title: 'Key Generator',
      description: 'Generate RSA key pairs, HMAC secrets, and export in various formats including JWKS.',
      items: ['RSA Key Pair Generation', 'HMAC Secret Generation', 'JWKS Export Format', 'PEM Format Support']
    },
    {
      icon: Award,
      title: 'Certificate Utility',
      description: 'Comprehensive certificate management: analyze PEM certificates, generate self-signed certificates, create CSRs, and build P12 files.',
      items: ['PEM Certificate Analysis', 'CSR Generation', 'Self-Signed Certificates', 'P12 File Creation & Base64']
    },
    {
      icon: Search,
      title: 'Regex Tester',
      description: 'Test and debug regular expressions with real-time matching, group extraction, and replacement functionality.',
      items: ['Real-time Pattern Testing', 'Match Highlighting', 'Capture Groups Display', 'Find & Replace Operations']
    },
    {
      icon: Smartphone,
      title: 'TOTP/2FA Generator',
      description: 'Generate Time-based One-Time Passwords for two-factor authentication with QR code support.',
      items: ['TOTP Code Generation', 'QR Code Creation', 'Multiple Algorithms (SHA1/256/512)', 'Real-time Code Updates']
    },
    {
      icon: BookOpen,
      title: 'Swagger/OpenAPI Preview',
      description: 'Load, validate, and preview OpenAPI/Swagger specifications with interactive documentation.',
      items: ['JSON/YAML Spec Loading', 'Validation & Error Detection', 'Endpoint Documentation', 'Model Schema Preview']
    },
    {
      icon: Hash,
      title: 'UUID Generator',
      description: 'Generate random UUIDs (Universally Unique Identifiers) version 4.',
      items: ['UUID v4 Generation', 'Copy to Clipboard', 'Instant Generation', 'Format Validation']
    },
    {
      icon: Code,
      title: 'Base64 Tool',
      description: 'Encode and decode Base64 strings with UTF-8 support.',
      items: ['Base64 Encoding', 'Base64 Decoding', 'UTF-8 Support', 'Bidirectional Conversion']
    },
    {
      icon: FileText,
      title: 'JSONLint',
      description: 'Validate, format, and minify JSON data with syntax highlighting.',
      items: ['JSON Validation', 'Auto Formatting', 'Minification', 'Error Detection']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to DevStack
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4 max-w-3xl mx-auto">
          Your complete stack of essential developer utilities for JWT creation & analysis, cryptographic operations, 
          text processing, certificate management, regex testing, 2FA generation, and data conversion. Each tool is designed for privacy-first development with local-only processing.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          Built with ❤️ by Vamsi
        </p>
        
        <div className="flex justify-center space-x-4">
          <a
            href="https://github.com/vamsidevbits/devstack"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
          >
            <Github className="h-5 w-5" />
            <span>View on GitHub</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isNewFeature = ['Regex Tester', 'TOTP/2FA Generator', 'Swagger/OpenAPI Preview'].includes(feature.title);
          const isEnhanced = feature.title === 'Certificate Utility';
          
          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 relative ${
                isNewFeature ? 'ring-2 ring-green-500 dark:ring-green-400' : 
                isEnhanced ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
              }`}
            >
              {isNewFeature && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  NEW
                </div>
              )}
              {isEnhanced && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  ENHANCED
                </div>
              )}
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {feature.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {feature.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0"></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Integrated Workflow
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Generate Keys & CSRs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create RSA key pairs, HMAC secrets, or Certificate Signing Requests</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Create Certificates & P12</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Generate self-signed certificates or combine keys/certs into P12 files</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sign JWTs & 2FA</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sign JWTs with your keys or generate TOTP codes for authentication</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Test & Document APIs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Use regex tester for patterns, validate certificates, and preview Swagger/OpenAPI docs</p>
          </div>
        </div>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center">
          Click on any tool tab above to get started. From JWT signing to regex testing, TOTP generation to certificate management, 
          API documentation preview to data validation, each utility is designed to be developer-friendly with instant results, comprehensive functionality, and privacy-focused local processing. No data leaves your browser.
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          🔒 Security Notice
        </h3>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
          This tool stores all data locally in your browser. No data is sent to external servers. 
          Always use secure connections (HTTPS) when working with real credentials in production environments.
        </p>
      </div>
    </div>
  );
}
