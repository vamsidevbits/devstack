import React, { useState } from 'react';
import { Copy, ArrowUpDown } from 'lucide-react';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const processInput = (value, currentMode) => {
    setError('');
    
    if (!value.trim()) {
      setOutput('');
      return;
    }

    try {
      if (currentMode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(value)));
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(value)));
        setOutput(decoded);
      }
    } catch (err) {
      setError(currentMode === 'encode' ? 'Failed to encode input' : 'Invalid Base64 string');
      setOutput('');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    processInput(value, mode);
  };

  const toggleMode = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    
    // Swap input and output
    setInput(output);
    setOutput(input);
    
    if (output) {
      processInput(output, newMode);
    }
  };

  const copyToClipboard = async () => {
    if (output) {
      try {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Base64 Encoder/Decoder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Encode and decode Base64 strings with UTF-8 support
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mode: {mode === 'encode' ? 'Encode' : 'Decode'}
              </h2>
              <button
                onClick={toggleMode}
                className="inline-flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>Switch Mode</span>
              </button>
            </div>
            <button
              onClick={clearAll}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
              </label>
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'encode' ? 'Encoded Base64' : 'Decoded Text'}
                </label>
                {output && (
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <textarea
                  value={output}
                  readOnly
                  placeholder={mode === 'encode' ? 'Base64 encoded result will appear here...' : 'Decoded text will appear here...'}
                  className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="text-red-700 dark:text-red-300 text-sm">
                ⚠️ {error}
              </div>
            </div>
          )}

          {copied && (
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">
              ✓ Copied to clipboard!
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
          About Base64 Encoding
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
          Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format.
        </p>
        <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
          <div><strong>Character Set:</strong> A-Z, a-z, 0-9, +, / (with = for padding)</div>
          <div><strong>Use Cases:</strong> Email attachments, data URLs, JSON Web Tokens</div>
          <div><strong>Note:</strong> This tool supports UTF-8 encoding for international characters</div>
        </div>
      </div>
    </div>
  );
}
