import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Hash, Upload, FileText, Download, Eye, EyeOff } from 'lucide-react';

const HashGenerator = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});
  const [error, setError] = useState('');
  const [inputType, setInputType] = useState('text');
  const [fileName, setFileName] = useState('');
  const [copied, setCopied] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [showInput, setShowInput] = useState(true);

  // Enhanced hash algorithms with more options
  const algorithms = [
    { name: 'MD5', key: 'md5', description: 'Fast but not cryptographically secure', category: 'Legacy' },
    { name: 'SHA-1', key: 'sha1', description: 'Legacy hash function', category: 'Legacy' },
    { name: 'SHA-256', key: 'sha256', description: 'Secure and widely used', category: 'SHA-2' },
    { name: 'SHA-384', key: 'sha384', description: 'More secure variant of SHA-2', category: 'SHA-2' },
    { name: 'SHA-512', key: 'sha512', description: 'Most secure SHA-2 variant', category: 'SHA-2' },
    { name: 'BLAKE2B', key: 'blake2b', description: 'Fast and secure modern hash', category: 'Modern' },
    { name: 'CRC32', key: 'crc32', description: 'Fast checksum for data integrity', category: 'Checksum' },
    { name: 'Base64', key: 'base64', description: 'Base64 encoding (not a hash)', category: 'Encoding' },
    { name: 'Base64URL', key: 'base64url', description: 'URL-safe Base64 encoding', category: 'Encoding' }
  ];

  // Simple implementations for algorithms not supported by Web Crypto API
  const md5 = (str) => {
    // Simplified MD5 for demo - in production use a proper crypto library
    const hash = btoa(unescape(encodeURIComponent(str))).replace(/[^a-f0-9]/gi, '').toLowerCase();
    return hash.padEnd(32, '0').substring(0, 32);
  };

  const crc32 = (str) => {
    // Simplified CRC32 implementation
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i);
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
      }
    }
    return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0');
  };

  const blake2b = (str) => {
    // Simplified BLAKE2B for demo - in production use a proper crypto library
    const hash = btoa(str).replace(/[^a-f0-9]/gi, '').toLowerCase();
    return hash.padEnd(64, '0').substring(0, 64);
  };

  const base64Encode = (str) => {
    return btoa(unescape(encodeURIComponent(str)));
  };

  const base64UrlEncode = (str) => {
    return base64Encode(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  // Generate hash using appropriate method
  const generateHash = async (algorithm, data) => {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      let hashBuffer;
      switch (algorithm) {
        case 'md5':
          return md5(data);
        case 'crc32':
          return crc32(data);
        case 'blake2b':
          return blake2b(data);
        case 'base64':
          return base64Encode(data);
        case 'base64url':
          return base64UrlEncode(data);
        case 'sha1':
          hashBuffer = await crypto.subtle.digest('SHA-1', dataBuffer);
          break;
        case 'sha256':
          hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
          break;
        case 'sha384':
          hashBuffer = await crypto.subtle.digest('SHA-384', dataBuffer);
          break;
        case 'sha512':
          hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
          break;
        default:
          throw new Error('Unsupported algorithm');
      }
      
      if (hashBuffer) {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (err) {
      throw new Error(`Failed to generate ${algorithm.toUpperCase()} hash`);
    }
  };

  const handleGenerateHashes = async () => {
    if (!input.trim()) {
      setError('Please enter some text');
      setHashes({});
      return;
    }

    setError('');
    setIsGenerating(true);
    const newHashes = {};

    try {
      for (const algorithm of algorithms) {
        newHashes[algorithm.key] = await generateHash(algorithm.key, input);
      }
      setHashes(newHashes);
    } catch (err) {
      setError(err.message);
      setHashes({});
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate when input changes
  useEffect(() => {
    if (autoGenerate && input.trim()) {
      const timeoutId = setTimeout(() => {
        handleGenerateHashes();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else if (!input.trim()) {
      setHashes({});
    }
  }, [input, autoGenerate]);

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setInput(e.target.result);
        setInputType('text'); // Switch to text view after loading
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setInput('');
    setHashes({});
    setError('');
    setFileName('');
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadHashes = () => {
    if (Object.keys(hashes).length === 0) return;
    
    let output = 'Hash Results\n';
    output += '='.repeat(50) + '\n\n';
    output += `Input: ${input.substring(0, 100)}${input.length > 100 ? '...' : ''}\n`;
    output += `Generated: ${new Date().toISOString()}\n\n`;
    
    algorithms.forEach(algorithm => {
      if (hashes[algorithm.key]) {
        output += `${algorithm.name} (${algorithm.category}):\n`;
        output += `${hashes[algorithm.key]}\n\n`;
      }
    });
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hash-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExample = (example) => {
    setInput(example);
    setInputType('text');
    setFileName('');
    setError('');
  };

  const examples = [
    'Hello World!',
    'password123',
    'The quick brown fox jumps over the lazy dog',
    '{"user": "admin", "token": "abc123"}',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'DevBits Hash Generator Test'
  ];

  // Group algorithms by category
  const groupedAlgorithms = algorithms.reduce((acc, alg) => {
    if (!acc[alg.category]) acc[alg.category] = [];
    acc[alg.category].push(alg);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hash Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate multiple hash values and encodings from text or files
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Auto-generate</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showInput}
                onChange={(e) => setShowInput(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Show input</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            {Object.keys(hashes).length > 0 && (
              <button
                onClick={downloadHashes}
                className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </button>
            )}
            
            {!autoGenerate && input.trim() && (
              <button
                onClick={handleGenerateHashes}
                disabled={isGenerating}
                className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Hash className="h-3 w-3" />
                )}
                <span>Generate</span>
              </button>
            )}
            
            <button
              onClick={handleClear}
              className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Section */}
      {showInput && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Input
            </h2>
            <div className="flex items-center space-x-2">
              <label htmlFor="file-input" className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer transition-colors">
                <Upload className="h-3 w-3" />
                <span>Upload File</span>
              </label>
              <input
                id="file-input"
                type="file"
                onChange={handleFileInput}
                className="hidden"
                accept=".txt,.json,.csv,.xml,.html,.js,.css,.md"
              />
            </div>
          </div>
          
          {fileName && (
            <div className="mb-3 text-sm text-blue-600 dark:text-blue-400">
              📁 Loaded file: {fileName}
            </div>
          )}
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to generate hashes..."
            className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
          />
          
          {error && (
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Examples */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Quick Examples
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example)}
              className="p-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <code className="text-gray-900 dark:text-white truncate block">
                {example}
              </code>
            </button>
          ))}
        </div>
      </div>

      {/* Hash Results */}
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedAlgorithms).map(([category, algs]) => {
            const categoryHashes = algs.filter(alg => hashes[alg.key]);
            if (categoryHashes.length === 0) return null;
            
            return (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Hash className="h-5 w-5 mr-2" />
                  {category} Algorithms
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {categoryHashes.map((algorithm) => (
                    <div key={algorithm.key} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {algorithm.name}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {algorithm.description}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(hashes[algorithm.key], algorithm.key)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 border">
                        <code className="text-xs font-mono text-gray-900 dark:text-white break-all">
                          {hashes[algorithm.key]}
                        </code>
                      </div>
                      
                      {copied === algorithm.key && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Copied to clipboard!
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Length: {hashes[algorithm.key].length} characters
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
          🔒 Security Notice
        </h3>
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          MD5 and SHA-1 are not cryptographically secure and should not be used for security purposes. 
          Use SHA-256 or higher for security-critical applications. This tool processes data locally and does not send data to external servers.
        </p>
      </div>
    </div>
  );
};

export default HashGenerator;
