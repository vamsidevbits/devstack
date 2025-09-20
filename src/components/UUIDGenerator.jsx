import React, { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

export default function UUIDGenerator() {
  const [uuid, setUuid] = useState('');
  const [copied, setCopied] = useState(false);

  const generateUUID = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setUuid(uuid);
  };

  const copyToClipboard = async () => {
    if (uuid) {
      try {
        await navigator.clipboard.writeText(uuid);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  React.useEffect(() => {
    generateUUID();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          UUID Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate random UUIDs (Universally Unique Identifiers) version 4
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated UUID
            </h2>
            <button
              onClick={generateUUID}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Generate New</span>
            </button>
          </div>

          <div className="relative">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="font-mono text-lg text-gray-900 dark:text-white break-all">
                {uuid || 'Click "Generate New" to create a UUID'}
              </div>
            </div>
            {uuid && (
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>

          {copied && (
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">
              ✓ Copied to clipboard!
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
          About UUID v4
        </h3>
        <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
          UUID version 4 uses random numbers to generate a unique identifier. The probability of generating duplicate UUIDs is negligible.
        </p>
        <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
          <div><strong>Format:</strong> 8-4-4-4-12 hexadecimal digits</div>
          <div><strong>Example:</strong> 550e8400-e29b-41d4-a716-446655440000</div>
          <div><strong>Use cases:</strong> Database primary keys, session IDs, file names</div>
        </div>
      </div>
    </div>
  );
}
