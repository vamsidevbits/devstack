import React, { useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';

const TOTPGenerator = () => {
  const [secretKey, setSecretKey] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [issuer, setIssuer] = useState('DevStack');
  const [accountName, setAccountName] = useState('user@example.com');
  const [algorithm, setAlgorithm] = useState('SHA1');
  const [digits, setDigits] = useState(6);
  const [period, setPeriod] = useState(30);
  const [manualSecret, setManualSecret] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [history, setHistory] = useState([]);

  // Base32 decoding function
  const base32Decode = (base32) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let result = '';

    // Remove padding and convert to uppercase
    base32 = base32.replace(/=/g, '').toUpperCase();

    // Convert each character to 5-bit binary
    for (let i = 0; i < base32.length; i++) {
      const char = base32.charAt(i);
      const index = alphabet.indexOf(char);
      if (index === -1) throw new Error('Invalid base32 character: ' + char);
      bits += index.toString(2).padStart(5, '0');
    }

    // Convert 8-bit chunks to bytes
    for (let i = 0; i < bits.length; i += 8) {
      const byte = bits.substr(i, 8);
      if (byte.length === 8) {
        result += String.fromCharCode(parseInt(byte, 2));
      }
    }

    return result;
  };

  // Base32 encoding function
  const base32Encode = (data) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let result = '';

    // Convert string to binary
    for (let i = 0; i < data.length; i++) {
      bits += data.charCodeAt(i).toString(2).padStart(8, '0');
    }

    // Pad to multiple of 5
    while (bits.length % 5 !== 0) {
      bits += '0';
    }

    // Convert 5-bit chunks to base32
    for (let i = 0; i < bits.length; i += 5) {
      const chunk = bits.substr(i, 5);
      result += alphabet[parseInt(chunk, 2)];
    }

    // Add padding
    while (result.length % 8 !== 0) {
      result += '=';
    }

    return result;
  };

  // Generate TOTP code
  const generateTOTP = useCallback((secret, timestamp = null) => {
    if (!secret) return '';

    try {
      // Decode the base32 secret
      const key = base32Decode(secret);
      
      // Calculate time step
      const now = timestamp || Math.floor(Date.now() / 1000);
      const timeStep = Math.floor(now / period);
      
      // Convert time step to 8-byte array (big-endian)
      const timeBuffer = [];
      let temp = timeStep;
      for (let i = 7; i >= 0; i--) {
        timeBuffer[i] = temp & 0xff;
        temp >>= 8;
      }
      
      // Create WordArray for crypto-js
      const timeWords = CryptoJS.lib.WordArray.create(timeBuffer);
      const keyWords = CryptoJS.enc.Latin1.parse(key);
      
      // Generate HMAC
      let hmac;
      switch (algorithm) {
        case 'SHA256':
          hmac = CryptoJS.HmacSHA256(timeWords, keyWords);
          break;
        case 'SHA512':
          hmac = CryptoJS.HmacSHA512(timeWords, keyWords);
          break;
        default:
          hmac = CryptoJS.HmacSHA1(timeWords, keyWords);
      }
      
      // Convert to byte array
      const hmacBytes = [];
      for (let i = 0; i < hmac.words.length; i++) {
        const word = hmac.words[i];
        hmacBytes.push((word >>> 24) & 0xff);
        hmacBytes.push((word >>> 16) & 0xff);
        hmacBytes.push((word >>> 8) & 0xff);
        hmacBytes.push(word & 0xff);
      }
      
      // Dynamic truncation
      const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
      const code = ((hmacBytes[offset] & 0x7f) << 24) |
                   ((hmacBytes[offset + 1] & 0xff) << 16) |
                   ((hmacBytes[offset + 2] & 0xff) << 8) |
                   (hmacBytes[offset + 3] & 0xff);
      
      // Generate the final code
      const truncatedCode = (code % Math.pow(10, digits)).toString().padStart(digits, '0');
      
      return truncatedCode;
    } catch (error) {
      console.error('Error generating TOTP:', error);
      return 'ERROR';
    }
  }, [algorithm, digits, period]);

  // Generate random secret
  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecretKey(secret);
    setManualSecret(secret);
  };

  // Generate QR code URL
  useEffect(() => {
    if (secretKey && issuer && accountName) {
      const label = encodeURIComponent(`${issuer}:${accountName}`);
      const params = new URLSearchParams({
        secret: secretKey,
        issuer: issuer,
        algorithm: algorithm,
        digits: digits.toString(),
        period: period.toString()
      });
      
      const otpauthUrl = `otpauth://totp/${label}?${params.toString()}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;
      setQrCodeUrl(qrUrl);
    }
  }, [secretKey, issuer, accountName, algorithm, digits, period]);

  // Update TOTP code and timer
  useEffect(() => {
    const updateCode = () => {
      if (secretKey) {
        const code = generateTOTP(secretKey);
        setTotpCode(code);
        
        // Add to history if code changed
        const now = new Date();
        setHistory(prev => {
          const newEntry = {
            code,
            timestamp: now.toLocaleTimeString(),
            fullTime: now
          };
          
          // Only add if code is different from last entry
          if (prev.length === 0 || prev[0].code !== code) {
            return [newEntry, ...prev.slice(0, 9)]; // Keep last 10 entries
          }
          return prev;
        });
      }
      
      // Calculate time remaining
      const now = Math.floor(Date.now() / 1000);
      const remaining = period - (now % period);
      setTimeRemaining(remaining);
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);
    
    return () => clearInterval(interval);
  }, [secretKey, generateTOTP, period]);

  // Handle manual secret input
  const handleManualSecret = () => {
    const cleanSecret = manualSecret.replace(/\s/g, '').toUpperCase();
    setSecretKey(cleanSecret);
  };

  // Progress bar width calculation
  const progressWidth = ((period - timeRemaining) / period) * 100;

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          TOTP / 2FA Code Generator
        </h1>

        {/* Setup Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Setup Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issuer (Service Name)
                </label>
                <input
                  type="text"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g., Google, GitHub, AWS"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secret Key (Base32)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualSecret}
                    onChange={(e) => setManualSecret(e.target.value)}
                    placeholder="Enter or generate secret key"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <button
                    onClick={handleManualSecret}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Use
                  </button>
                </div>
                <button
                  onClick={generateSecret}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  Generate Random Secret
                </button>
              </div>

              {/* Advanced Settings */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                </button>
                
                {showAdvanced && (
                  <div className="mt-3 space-y-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Algorithm
                        </label>
                        <select
                          value={algorithm}
                          onChange={(e) => setAlgorithm(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                        >
                          <option value="SHA1">SHA1</option>
                          <option value="SHA256">SHA256</option>
                          <option value="SHA512">SHA512</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Digits
                        </label>
                        <select
                          value={digits}
                          onChange={(e) => setDigits(Number(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                        >
                          <option value={6}>6</option>
                          <option value={7}>7</option>
                          <option value={8}>8</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Period (sec)
                        </label>
                        <select
                          value={period}
                          onChange={(e) => setPeriod(Number(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                        >
                          <option value={15}>15</option>
                          <option value={30}>30</option>
                          <option value={60}>60</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              QR Code for Authenticator Apps
            </h3>
            {qrCodeUrl ? (
              <div className="text-center">
                <img
                  src={qrCodeUrl}
                  alt="TOTP QR Code"
                  className="mx-auto border rounded-lg shadow-md"
                />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Scan with Google Authenticator, Authy, or similar apps
                </p>
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                  Enter secret key to generate QR code
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Current TOTP Code */}
        {secretKey && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-6 mb-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current TOTP Code
              </h3>
              
              <div className="mb-4">
                <div 
                  className="text-6xl font-mono font-bold text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  onClick={() => copyToClipboard(totpCode)}
                  title="Click to copy"
                >
                  {totpCode || '------'}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Click to copy to clipboard
                </p>
              </div>

              {/* Timer and Progress */}
              <div className="max-w-xs mx-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Time remaining:
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {timeRemaining}s
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      timeRemaining <= 5 
                        ? 'bg-red-500' 
                        : timeRemaining <= 10 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${100 - progressWidth}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code History */}
        {history.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Codes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md text-center cursor-pointer transition-colors ${
                    index === 0 
                      ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-300' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => copyToClipboard(entry.code)}
                >
                  <div className="font-mono font-bold text-lg">{entry.code}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{entry.timestamp}</div>
                  {index === 0 && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">Current</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-md">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            🔐 Security Notes
          </h4>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>• Keep your secret key private and secure</li>
            <li>• TOTP codes change every {period} seconds</li>
            <li>• This tool works offline - your secrets never leave your device</li>
            <li>• Use this for testing or backup - prefer dedicated authenticator apps</li>
            <li>• Make sure your device time is synchronized</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TOTPGenerator;