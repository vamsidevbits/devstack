import React, { useState } from 'react';
import { Copy, CheckCircle, AlertCircle, Code } from 'lucide-react';

export default function JSONLint() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [copied, setCopied] = useState(false);

  const validateAndFormat = (jsonString) => {
    setError('');
    setIsValid(null);
    
    if (!jsonString.trim()) {
      setOutput('');
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setIsValid(true);
    } catch (err) {
      setError(err.message);
      setOutput('');
      setIsValid(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    validateAndFormat(value);
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

  const minifyJSON = () => {
    if (input.trim()) {
      try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        setOutput(minified);
        setIsValid(true);
        setError('');
      } catch (err) {
        setError(err.message);
        setIsValid(false);
      }
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setIsValid(null);
  };

  const loadSample = () => {
    const sampleJSON = `{
  "name": "John Doe",
  "age": 30,
  "city": "New York",
  "hobbies": ["reading", "swimming", "coding"],
  "address": {
    "street": "123 Main St",
    "zipCode": "10001"
  },
  "isActive": true,
  "balance": 1234.56
}`;
    setInput(sampleJSON);
    validateAndFormat(sampleJSON);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          JSON Formatter & Validator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Validate, format, and minify JSON data
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                JSON Editor
              </h2>
              {isValid !== null && (
                <div className={`flex items-center space-x-1 ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {isValid ? 'Valid JSON' : 'Invalid JSON'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadSample}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Load Sample
              </button>
              <button
                onClick={minifyJSON}
                className="px-3 py-1 text-sm bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
                disabled={!input.trim()}
              >
                Minify
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                JSON Input
              </label>
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Paste your JSON here..."
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Formatted Output
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
              <textarea
                value={output}
                readOnly
                placeholder="Formatted JSON will appear here..."
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none font-mono text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-800 dark:text-red-200 font-medium">JSON Syntax Error</h4>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1 font-mono">{error}</p>
                </div>
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
          <Code className="h-5 w-5 inline mr-2" />
          JSON Tips
        </h3>
        <div className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
          <div><strong>Format:</strong> Automatically formats and validates JSON syntax</div>
          <div><strong>Minify:</strong> Removes whitespace to reduce JSON size</div>
          <div><strong>Validate:</strong> Checks for proper JSON syntax and structure</div>
          <div><strong>Common Errors:</strong> Missing quotes, trailing commas, unclosed brackets</div>
        </div>
      </div>
    </div>
  );
}
