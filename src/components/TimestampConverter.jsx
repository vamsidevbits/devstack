import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Clock, Calendar, Globe, ArrowUpDown } from 'lucide-react';

const TimestampConverter = () => {
  const [unixTimestamp, setUnixTimestamp] = useState('');
  const [humanDate, setHumanDate] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [copied, setCopied] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [format, setFormat] = useState('iso');

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatOptions = {
    iso: { label: 'ISO 8601', format: (date) => date.toISOString() },
    local: { label: 'Local String', format: (date) => date.toString() },
    locale: { label: 'Locale String', format: (date) => date.toLocaleString() },
    utc: { label: 'UTC String', format: (date) => date.toUTCString() },
    custom: { label: 'Custom Format', format: (date) => formatCustomDate(date) }
  };

  const formatCustomDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const convertFromUnix = (timestamp) => {
    try {
      if (!timestamp) {
        setHumanDate('');
        return;
      }
      
      // Handle both seconds and milliseconds
      let ts = parseInt(timestamp);
      if (ts.toString().length === 10) {
        // Seconds - convert to milliseconds
        ts = ts * 1000;
      } else if (ts.toString().length !== 13) {
        throw new Error('Invalid timestamp length');
      }
      
      const date = new Date(ts);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid timestamp');
      }
      
      setHumanDate(formatOptions[format].format(date));
    } catch (error) {
      setHumanDate('Invalid timestamp');
    }
  };

  const convertFromHuman = (dateString) => {
    try {
      if (!dateString) {
        setUnixTimestamp('');
        return;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      setUnixTimestamp(Math.floor(date.getTime() / 1000).toString());
    } catch (error) {
      setUnixTimestamp('Invalid date');
    }
  };

  const handleUnixChange = (value) => {
    setUnixTimestamp(value);
    convertFromUnix(value);
  };

  const handleHumanChange = (value) => {
    setHumanDate(value);
    convertFromHuman(value);
  };

  const setCurrentTimestamp = () => {
    const now = Math.floor(Date.now() / 1000);
    handleUnixChange(now.toString());
  };

  const setCurrentDate = () => {
    const now = new Date();
    handleHumanChange(formatOptions[format].format(now));
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

  const clearAll = () => {
    setUnixTimestamp('');
    setHumanDate('');
  };

  const getTimezoneOffset = () => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset <= 0 ? '+' : '-';
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp || timestamp === 'Invalid timestamp') return '';
    
    try {
      let ts = parseInt(timestamp);
      if (ts.toString().length === 10) {
        ts = ts * 1000;
      }
      
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (Math.abs(diffSeconds) < 60) {
        return diffSeconds >= 0 ? `${diffSeconds} seconds ago` : `in ${Math.abs(diffSeconds)} seconds`;
      } else if (Math.abs(diffMinutes) < 60) {
        return diffMinutes >= 0 ? `${diffMinutes} minutes ago` : `in ${Math.abs(diffMinutes)} minutes`;
      } else if (Math.abs(diffHours) < 24) {
        return diffHours >= 0 ? `${diffHours} hours ago` : `in ${Math.abs(diffHours)} hours`;
      } else {
        return diffDays >= 0 ? `${diffDays} days ago` : `in ${Math.abs(diffDays)} days`;
      }
    } catch (error) {
      return '';
    }
  };

  // Auto-convert when format changes
  useEffect(() => {
    if (unixTimestamp && unixTimestamp !== 'Invalid date') {
      convertFromUnix(unixTimestamp);
    }
  }, [format]);

  const commonTimestamps = [
    { label: 'Unix Epoch (1970-01-01)', value: '0' },
    { label: 'Y2K (2000-01-01)', value: '946684800' },
    { label: 'JavaScript Max Date', value: '8640000000000' },
    { label: '2024-01-01 00:00:00', value: '1704067200' },
    { label: '2025-01-01 00:00:00', value: '1735689600' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Timestamp Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert between Unix timestamps and human-readable dates
        </p>
      </div>

      {/* Current Time Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center justify-center">
            <Clock className="h-5 w-5 mr-2" />
            Current Time
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unix Timestamp</div>
              <div className="text-xl font-mono text-blue-600 dark:text-blue-400">
                {Math.floor(currentTime.getTime() / 1000)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Milliseconds: {currentTime.getTime()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Human Readable</div>
              <div className="text-lg text-blue-600 dark:text-blue-400">
                {currentTime.toISOString().replace('T', ' ').replace('Z', ' UTC')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Local timezone: {getTimezoneOffset()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Converter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Timestamp Converter
          </h2>
          <div className="flex items-center space-x-2">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {Object.entries(formatOptions).map(([key, option]) => (
                <option key={key} value={key}>{option.label}</option>
              ))}
            </select>
            <button
              onClick={clearAll}
              className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unix Timestamp Input */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unix Timestamp
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={setCurrentTimestamp}
                    className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Clock className="h-3 w-3" />
                    <span>Now</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(unixTimestamp, 'unix')}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={unixTimestamp}
                onChange={(e) => handleUnixChange(e.target.value)}
                placeholder="Enter Unix timestamp (seconds or milliseconds)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
              />
              {unixTimestamp && unixTimestamp !== 'Invalid date' && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Relative: {getRelativeTime(unixTimestamp)}
                </div>
              )}
            </div>

            {/* Common Timestamps */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Common Timestamps
              </label>
              <div className="space-y-1">
                {commonTimestamps.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleUnixChange(item.value)}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    <div className="font-mono text-primary-600 dark:text-primary-400">{item.value}</div>
                    <div className="text-gray-600 dark:text-gray-400">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Human Date Input */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Human Readable Date
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={setCurrentDate}
                    className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <Calendar className="h-3 w-3" />
                    <span>Now</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(humanDate, 'human')}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <textarea
                value={humanDate}
                onChange={(e) => handleHumanChange(e.target.value)}
                placeholder="Enter date (e.g., 2024-01-01 12:00:00, January 1, 2024, etc.)"
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Format Examples */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Supported Date Formats
              </label>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div className="font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  2024-01-01 12:00:00
                </div>
                <div className="font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  January 1, 2024 12:00:00 PM
                </div>
                <div className="font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  2024-01-01T12:00:00Z
                </div>
                <div className="font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  Mon Jan 01 2024 12:00:00 GMT+0000
                </div>
                <div className="font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  01/01/2024 12:00:00
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {(unixTimestamp || humanDate) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Additional Information
          </h3>
          
          {unixTimestamp && unixTimestamp !== 'Invalid date' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Different Formats */}
              {Object.entries(formatOptions).map(([key, option]) => {
                try {
                  let ts = parseInt(unixTimestamp);
                  if (ts.toString().length === 10) ts = ts * 1000;
                  const date = new Date(ts);
                  return (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {option.label}
                      </div>
                      <div className="text-sm font-mono text-gray-900 dark:text-white break-all">
                        {option.format(date)}
                      </div>
                    </div>
                  );
                } catch (error) {
                  return null;
                }
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimestampConverter;
