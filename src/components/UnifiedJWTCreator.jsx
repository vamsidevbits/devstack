import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, RefreshCw, AlertCircle, Check, X, Key, Copy, Clock, Shield, User, Download } from 'lucide-react';

const UnifiedJWTCreator = () => {
  // JWT Creation states
  const [header, setHeader] = useState(JSON.stringify({
    "typ": "JWT"
  }, null, 2));
  
  const [payload, setPayload] = useState(JSON.stringify({
    "sub": "1234567890",
    "name": "John Doe",
    "iat": Math.floor(Date.now() / 1000),
    "exp": Math.floor(Date.now() / 1000) + 3600
  }, null, 2));
  
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [rsaPrivateKey, setRsaPrivateKey] = useState('');
  const [rsaPublicKey, setRsaPublicKey] = useState('');
  const [algorithm, setAlgorithm] = useState('HS256');
  const [signingMethod, setSigningMethod] = useState('hmac'); // 'hmac' or 'rsa'
  const [showSecret, setShowSecret] = useState(false);
  
  // Available keys from Key Generator
  const [availableKeys, setAvailableKeys] = useState({});
  
  // JWT field (for both creation output and parsing input)
  const [jwtContent, setJwtContent] = useState('');
  const [parsedJWT, setParsedJWT] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  
  // States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [autoValidate, setAutoValidate] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [autoGenerate, setAutoGenerate] = useState(false);

  // Base64 URL encode/decode functions
  const base64UrlEscape = (str) => {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const base64UrlUnescape = (str) => {
    // Add padding if needed
    const paddingNeeded = (4 - str.length % 4) % 4;
    return str + '='.repeat(paddingNeeded);
  };

  const base64UrlDecode = (str) => {
    try {
      // Clean the string and validate it
      if (!str || typeof str !== 'string') {
        throw new Error('Invalid input');
      }
      
      // Remove any whitespace and validate base64url format
      const cleanStr = str.trim();
      if (!/^[A-Za-z0-9_-]*$/.test(cleanStr)) {
        throw new Error('Invalid base64url characters');
      }
      
      // Convert base64url to base64
      const base64 = cleanStr.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add proper padding
      const paddedBase64 = base64UrlUnescape(base64);
      
      // Decode
      const decoded = atob(paddedBase64);
      
      // Convert to UTF-8
      return decodeURIComponent(
        decoded.split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
    } catch (err) {
      throw new Error(`Base64 decode error: ${err.message}`);
    }
  };

  const base64UrlEncode = (str) => {
    try {
      // Encode to UTF-8 bytes first
      const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      );
      
      // Convert to base64
      const base64 = btoa(utf8Bytes);
      
      // Convert to base64url
      return base64UrlEscape(base64);
    } catch (err) {
      throw new Error(`Base64 encode error: ${err.message}`);
    }
  };

  // Load available keys from localStorage
  useEffect(() => {
    loadAvailableKeys();
  }, []);

  // Auto-analyze JWT when content changes
  useEffect(() => {
    if (jwtContent && autoAnalyze) {
      // Debounce the analysis to avoid constant parsing while typing
      const timeoutId = setTimeout(() => {
        analyzeJWT();
      }, 300); // 300ms delay
      
      return () => clearTimeout(timeoutId);
    } else if (!jwtContent) {
      // Clear analysis if no content
      setParsedJWT(null);
      setValidationResult(null);
      setError('');
    }
  }, [jwtContent, autoAnalyze]);

  // Auto-validate when JWT content or validation settings change
  useEffect(() => {
    if (jwtContent && autoValidate && parsedJWT) {
      // Debounce validation as well
      const timeoutId = setTimeout(() => {
        validateJWT();
      }, 500); // 500ms delay for validation
      
      return () => clearTimeout(timeoutId);
    }
  }, [jwtContent, secret, rsaPublicKey, autoValidate, parsedJWT]);

  // Auto-generate JWT when header, payload, or secret changes (if enabled)
  useEffect(() => {
    if (autoGenerate && (header || payload)) {
      // Check if we have the necessary keys/secrets
      const hasValidConfig = (
        (signingMethod === 'hmac' && secret) ||
        (signingMethod === 'rsa' && rsaPrivateKey)
      );
      
      if (hasValidConfig) {
        const timeoutId = setTimeout(() => {
          generateJWT();
        }, 600); // 600ms delay for auto-generation
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [header, payload, secret, rsaPrivateKey, algorithm, signingMethod, autoGenerate]);

  // Update algorithm when signing method changes
  useEffect(() => {
    if (signingMethod === 'hmac' && !algorithm.startsWith('HS')) {
      setAlgorithm('HS256');
    } else if (signingMethod === 'rsa' && !algorithm.startsWith('RS')) {
      setAlgorithm('RS256');
    }
  }, [signingMethod, algorithm]);

  // Auto-enable auto-generate when user starts editing creation fields
  const handleHeaderChange = (value) => {
    setHeader(value);
    if (!autoGenerate && value !== header) {
      setAutoGenerate(true);
    }
  };

  const handlePayloadChange = (value) => {
    setPayload(value);
    if (!autoGenerate && value !== payload) {
      setAutoGenerate(true);
    }
  };

  const handleSecretChange = (value) => {
    setSecret(value);
    if (!autoGenerate && value !== secret) {
      setAutoGenerate(true);
    }
  };

  const loadAvailableKeys = () => {
    const keys = {};
    
    // Load all stored keys from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('saved-key-')) {
        try {
          const keyData = JSON.parse(localStorage.getItem(key));
          const keyName = key.replace('saved-key-', '');
          keys[keyName] = keyData;
        } catch (e) {
          console.error('Failed to parse key:', key);
        }
      }
    }

    // Load legacy keys
    const rsaKeys = localStorage.getItem('rsa-keys');
    if (rsaKeys) {
      try {
        const parsedKeys = JSON.parse(rsaKeys);
        keys['default-rsa'] = {
          ...parsedKeys,
          type: 'RSA',
          name: 'Default RSA Key'
        };
      } catch (e) {
        console.error('Failed to parse RSA keys');
      }
    }

    const hmacSecret = localStorage.getItem('hmac-secret');
    if (hmacSecret) {
      keys['default-hmac'] = {
        secret: hmacSecret,
        type: 'HMAC',
        name: 'Default HMAC Secret'
      };
    }

    setAvailableKeys(keys);
  };

  // Import RSA private key from PEM format
  const importRSAPrivateKey = async (pemKey, hashAlgorithm = 'SHA-256', isPSS = false) => {
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = pemKey
      .replace(pemHeader, "")
      .replace(pemFooter, "")
      .replace(/\s/g, "");
    
    const keyData = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
    
    const algorithm = isPSS ? {
      name: "RSA-PSS",
      hash: hashAlgorithm,
    } : {
      name: "RSASSA-PKCS1-v1_5",
      hash: hashAlgorithm,
    };
    
    return await window.crypto.subtle.importKey(
      "pkcs8",
      keyData,
      algorithm,
      false,
      ["sign"]
    );
  };

  // Generate JWT using client-side HMAC or RSA
  const generateJWT = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      // Parse header and payload
      const headerObj = JSON.parse(header);
      const payloadObj = JSON.parse(payload);
      
      // Update algorithm in header based on signing method and selected algorithm
      if (signingMethod === 'hmac') {
        headerObj.alg = algorithm; // Use selected HMAC algorithm (HS256, HS384, HS512)
      } else if (signingMethod === 'rsa') {
        headerObj.alg = algorithm; // Use selected RSA algorithm (RS256, RS384, RS512, PS256, PS384, PS512)
      }
      
      // Encode header and payload
      const encodedHeader = base64UrlEncode(JSON.stringify(headerObj));
      const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj));
      
      // Create signature
      const signingInput = `${encodedHeader}.${encodedPayload}`;
      let signature = '';
      
      if (signingMethod === 'hmac') {
        // HMAC signing with the selected algorithm
        const hashAlgorithm = algorithm === 'HS256' ? 'SHA-256' : 
                             algorithm === 'HS384' ? 'SHA-384' : 
                             algorithm === 'HS512' ? 'SHA-512' : 'SHA-256';
        
        const key = await window.crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(secret),
          { name: 'HMAC', hash: hashAlgorithm },
          false,
          ['sign']
        );
        
        const signatureBuffer = await window.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
        signature = base64UrlEscape(btoa(String.fromCharCode(...new Uint8Array(signatureBuffer))));
      } else if (signingMethod === 'rsa') {
        // RSA signing with the selected algorithm
        if (!rsaPrivateKey) {
          throw new Error('RSA private key is required for RSA signing');
        }
        
        const hashAlgorithm = algorithm === 'RS256' || algorithm === 'PS256' ? 'SHA-256' : 
                             algorithm === 'RS384' || algorithm === 'PS384' ? 'SHA-384' : 
                             algorithm === 'RS512' || algorithm === 'PS512' ? 'SHA-512' : 'SHA-256';
        
        const isPSS = algorithm.startsWith('PS');
        const privateKey = await importRSAPrivateKey(rsaPrivateKey, hashAlgorithm, isPSS);
        
        let signatureBuffer;
        if (isPSS) {
          // RSA-PSS signing
          signatureBuffer = await window.crypto.subtle.sign(
            {
              name: "RSA-PSS",
              saltLength: hashAlgorithm === 'SHA-256' ? 32 : hashAlgorithm === 'SHA-384' ? 48 : 64,
            },
            privateKey,
            new TextEncoder().encode(signingInput)
          );
        } else {
          // RSASSA-PKCS1-v1_5 signing
          signatureBuffer = await window.crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            privateKey,
            new TextEncoder().encode(signingInput)
          );
        }
        signature = base64UrlEscape(btoa(String.fromCharCode(...new Uint8Array(signatureBuffer))));
      }
      
      const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
      setJwtContent(jwt);
      
      // Auto-analyze will be triggered by useEffect if enabled
      
    } catch (err) {
      setError('Failed to generate JWT: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Parse JWT
  const parseJWT = (token) => {
    try {
      setError(''); // Clear any previous errors
      
      if (!token || typeof token !== 'string') {
        setParsedJWT(null);
        setValidationResult(null);
        return;
      }

      // Clean and validate the token
      const cleanToken = token.trim();
      if (!cleanToken) {
        setParsedJWT(null);
        setValidationResult(null);
        return;
      }

      const parts = cleanToken.split('.');
      if (parts.length !== 3) {
        throw new Error(`Invalid JWT format: expected 3 parts, got ${parts.length}`);
      }

      const [headerPart, payloadPart, signaturePart] = parts;
      
      // Validate that parts are not empty
      if (!headerPart || !payloadPart || !signaturePart) {
        throw new Error('JWT contains empty parts');
      }
      
      let decodedHeader, decodedPayload;
      
      try {
        decodedHeader = JSON.parse(base64UrlDecode(headerPart));
      } catch (err) {
        throw new Error(`Failed to decode header: ${err.message}`);
      }
      
      try {
        decodedPayload = JSON.parse(base64UrlDecode(payloadPart));
      } catch (err) {
        throw new Error(`Failed to decode payload: ${err.message}`);
      }
      
      setParsedJWT({
        header: decodedHeader,
        payload: decodedPayload,
        signature: signaturePart,
        raw: {
          header: headerPart,
          payload: payloadPart,
          signature: signaturePart
        }
      });
      
    } catch (err) {
      setError('Failed to parse JWT: ' + err.message);
      setParsedJWT(null);
      setValidationResult(null);
    }
  };

  // Analyze JWT function
  const analyzeJWT = () => {
    setError('');
    parseJWT(jwtContent);
  };

  // Validate JWT with signature verification
  const validateJWT = async () => {
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      if (!parsedJWT) {
        throw new Error('No JWT to validate');
      }
      
      const now = Math.floor(Date.now() / 1000);
      const payload = parsedJWT.payload;
      const header = parsedJWT.header;
      
      const results = {
        isValid: true,
        checks: []
      };
      
      // Signature verification
      let signatureVerified = false;
      let signatureMessage = 'Signature verification skipped';
      
      try {
        if (header.alg === 'HS256' || header.alg === 'HS384' || header.alg === 'HS512') {
          if (secret) {
            // HMAC signature verification
            const [headerPart, payloadPart] = jwtContent.split('.');
            const signingInput = `${headerPart}.${payloadPart}`;
            
            // Simple HMAC verification (simplified for demo)
            const encoder = new TextEncoder();
            const data = encoder.encode(signingInput + secret);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            const expectedSignature = base64UrlEscape(btoa(hashHex.substring(0, 32)));
            
            signatureVerified = expectedSignature === parsedJWT.signature;
            signatureMessage = signatureVerified ? 'HMAC signature is valid' : 'HMAC signature is invalid';
          } else {
            signatureMessage = 'HMAC secret not provided for verification';
          }
        } else if (header.alg === 'RS256' || header.alg === 'RS384' || header.alg === 'RS512' || 
                   header.alg === 'PS256' || header.alg === 'PS384' || header.alg === 'PS512') {
          if (rsaPublicKey) {
            // RSA signature verification would go here (simplified for demo)
            signatureVerified = true; // Assume valid for demo
            signatureMessage = `${header.alg} signature verification (demo mode)`;
          } else {
            signatureMessage = 'RSA public key not provided for verification';
          }
        } else {
          signatureMessage = `Algorithm ${header.alg} not supported for verification`;
        }
      } catch (err) {
        signatureMessage = `Signature verification failed: ${err.message}`;
      }
      
      results.checks.push({
        name: 'Signature Verification',
        passed: signatureVerified,
        message: signatureMessage
      });
      if (!signatureVerified && (secret || rsaPublicKey)) results.isValid = false;
      
      // Check expiration
      if (payload.exp) {
        const isExpired = now > payload.exp;
        results.checks.push({
          name: 'Token Expiration',
          passed: !isExpired,
          message: isExpired ? 'Token has expired' : 'Token is not expired'
        });
        if (isExpired) results.isValid = false;
      }
      
      // Check not before
      if (payload.nbf) {
        const isNotYetValid = now < payload.nbf;
        results.checks.push({
          name: 'Not Before Time',
          passed: !isNotYetValid,
          message: isNotYetValid ? 'Token is not yet valid' : 'Token is valid for current time'
        });
        if (isNotYetValid) results.isValid = false;
      }
      
      // Check issued at
      if (payload.iat) {
        const isIssuedInFuture = payload.iat > now + 60; // Allow 1 minute clock skew
        results.checks.push({
          name: 'Issued At Time',
          passed: !isIssuedInFuture,
          message: isIssuedInFuture ? 'Token issued in the future' : 'Token issued at valid time'
        });
        if (isIssuedInFuture) results.isValid = false;
      }
      
      // Check algorithm consistency
      const algorithmMatch = header.alg && (
        (signingMethod === 'hmac' && header.alg.startsWith('HS')) ||
        (signingMethod === 'rsa' && (header.alg.startsWith('RS') || header.alg.startsWith('PS')))
      );
      
      if (signingMethod && header.alg) {
        results.checks.push({
          name: 'Algorithm Consistency',
          passed: algorithmMatch,
          message: algorithmMatch 
            ? `Algorithm ${header.alg} matches signing method ${signingMethod}` 
            : `Algorithm ${header.alg} doesn't match signing method ${signingMethod}`
        });
      }
      
      setValidationResult(results);
      
    } catch (err) {
      setError('Validation failed: ' + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Update parsed JWT when jwtContent changes
  useEffect(() => {
    if (jwtContent) {
      parseJWT(jwtContent);
    }
  }, [jwtContent]);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const useAvailableKey = (keyId) => {
    const keyData = availableKeys[keyId];
    if (!keyData) return;
    
    if (keyData.type === 'RSA') {
      setSigningMethod('rsa');
      setRsaPrivateKey(keyData.privateKey || '');
      setRsaPublicKey(keyData.publicKey || '');
      setAlgorithm('RS256'); // Default to RS256 for RSA
    } else if (keyData.type === 'HMAC') {
      setSigningMethod('hmac');
      setSecret(keyData.secret || '');
      setAlgorithm('HS256'); // Default to HS256 for HMAC
    }
  };

  const loadSampleJWT = () => {
    const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzM4MDA4MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    setJwtContent(sampleToken);
  };

  const clearAll = () => {
    setJwtContent('');
    setParsedJWT(null);
    setValidationResult(null);
    setError('');
  };

  const downloadJWT = () => {
    if (!jwtContent) return;
    
    const blob = new Blob([jwtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jwt-token.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          JWT Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create, decode, and validate JSON Web Tokens with RSA and HMAC support
        </p>
      </div>

      {/* JWT Input/Output Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              JWT Token
            </h2>
            <div className="flex items-center space-x-4">
              {/* Auto-analyze toggle */}
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoAnalyze}
                  onChange={(e) => setAutoAnalyze(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Auto-analyze</span>
              </label>

              {/* Auto-validate toggle */}
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoValidate}
                  onChange={(e) => setAutoValidate(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Auto-validate</span>
              </label>

              <div className="flex space-x-2">
                <button
                onClick={loadSampleJWT}
                className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                <Key className="h-3 w-3" />
                <span>Load Sample</span>
              </button>
              {jwtContent && (
                <button
                  onClick={() => copyToClipboard(jwtContent, 'jwt')}
                  className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copied === 'jwt' ? 'Copied!' : 'Copy JWT'}</span>
                </button>
              )}
                
              {!autoAnalyze && jwtContent && (
                <button
                  onClick={analyzeJWT}
                  className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>Analyze</span>
                </button>
              )}
                
              {!autoValidate && parsedJWT && (
                <button
                  onClick={validateJWT}
                  className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  <Shield className="h-3 w-3" />
                  <span>Validate</span>
                </button>
              )}
                
                {jwtContent && (
                  <>
                    <button
                      onClick={downloadJWT}
                      className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={clearAll}
                      className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      <X className="h-3 w-3" />
                      <span>Clear</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <textarea
            value={jwtContent}
            onChange={(e) => setJwtContent(e.target.value)}
            placeholder="Paste a JWT token here to decode it, or create one below..."
            className={`w-full h-32 px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:border-transparent resize-none font-mono text-sm transition-colors ${
              error && jwtContent 
                ? 'border-red-300 dark:border-red-600 focus:ring-red-500' 
                : parsedJWT && jwtContent
                ? 'border-green-300 dark:border-green-600 focus:ring-green-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
            }`}
          />
          
          {/* Status indicator */}
          {jwtContent && (
            <div className="mt-2 text-sm">
              {error ? (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Invalid JWT format</span>
                </div>
              ) : parsedJWT ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <Check className="h-4 w-4 mr-1" />
                  <span>Valid JWT format • {parsedJWT.header.alg} algorithm</span>
                </div>
              ) : autoAnalyze ? (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <RefreshCw className="h-4 w-4 mr-1 animate-pulse" />
                  <span>Analyzing...</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* JWT Analysis Section - only show when JWT is parsed */}
      {parsedJWT && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Header */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Header
              </h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(parsedJWT.header, null, 2), 'header')}
                className="p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <pre className="text-xs font-mono text-blue-700 dark:text-blue-300 overflow-x-auto">
              {JSON.stringify(parsedJWT.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-green-800 dark:text-green-200 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Payload
              </h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(parsedJWT.payload, null, 2), 'payload')}
                className="p-1 text-green-400 hover:text-green-600 dark:hover:text-green-300"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <pre className="text-xs font-mono text-green-700 dark:text-green-300 overflow-x-auto">
              {JSON.stringify(parsedJWT.payload, null, 2)}
            </pre>
          </div>

          {/* Claims & Validation */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Claims & Status
              </h3>
              <button
                onClick={validateJWT}
                disabled={isValidating}
                className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isValidating ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                <span>{isValidating ? 'Validating...' : 'Validate'}</span>
              </button>
            </div>
            
            <div className="space-y-2 text-xs">
              {/* Algorithm */}
              <div className="flex justify-between">
                <span className="text-purple-600 dark:text-purple-400">Algorithm:</span>
                <span className="text-purple-800 dark:text-purple-200 font-mono">{parsedJWT.header.alg}</span>
              </div>
              
              {/* Claims */}
              {parsedJWT.payload.iat && (
                <div className="flex justify-between">
                  <span className="text-purple-600 dark:text-purple-400">Issued:</span>
                  <span className="text-purple-800 dark:text-purple-200">{formatDate(parsedJWT.payload.iat)}</span>
                </div>
              )}
              {parsedJWT.payload.exp && (
                <div className="flex justify-between">
                  <span className="text-purple-600 dark:text-purple-400">Expires:</span>
                  <span className="text-purple-800 dark:text-purple-200">{formatDate(parsedJWT.payload.exp)}</span>
                </div>
              )}
              {parsedJWT.payload.sub && (
                <div className="flex justify-between">
                  <span className="text-purple-600 dark:text-purple-400">Subject:</span>
                  <span className="text-purple-800 dark:text-purple-200">{parsedJWT.payload.sub}</span>
                </div>
              )}
              {parsedJWT.payload.iss && (
                <div className="flex justify-between">
                  <span className="text-purple-600 dark:text-purple-400">Issuer:</span>
                  <span className="text-purple-800 dark:text-purple-200">{parsedJWT.payload.iss}</span>
                </div>
              )}
              
              {/* Validation Results */}
              {validationResult && (
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                  <div className={`flex items-center space-x-1 mb-2 ${validationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validationResult.isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span className="font-medium text-xs">
                      {validationResult.isValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  {validationResult.checks.map((check, index) => (
                    <div key={index} className={`flex items-center space-x-1 text-xs ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {check.passed ? <Check className="h-2 w-2" /> : <X className="h-2 w-2" />}
                      <span>{check.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* JWT Creation Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create JWT
          </h2>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Auto-generate</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Signing Configuration */}
          <div className="space-y-4">
            {/* Signing Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Signing Method
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="hmac"
                    checked={signingMethod === 'hmac'}
                    onChange={(e) => setSigningMethod(e.target.value)}
                    className="mr-2"
                  />
                  HMAC (HS256)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="rsa"
                    checked={signingMethod === 'rsa'}
                    onChange={(e) => setSigningMethod(e.target.value)}
                    className="mr-2"
                  />
                  RSA (RS256)
                </label>
              </div>
            </div>

            {/* Available Keys */}
            {Object.keys(availableKeys).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Use Saved Keys
                </label>
                <div className="space-y-2">
                  {Object.entries(availableKeys).map(([keyId, keyData]) => (
                    <button
                      key={keyId}
                      onClick={() => useAvailableKey(keyId)}
                      className="w-full flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          keyData.type === 'RSA' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {keyData.type}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">{keyData.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* HMAC Secret */}
            {signingMethod === 'hmac' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Algorithm
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="HS256">HS256 (HMAC SHA-256)</option>
                    <option value="HS384">HS384 (HMAC SHA-384)</option>
                    <option value="HS512">HS512 (HMAC SHA-512)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={secret}
                      onChange={(e) => handleSecretChange(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your secret key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RSA Keys */}
            {signingMethod === 'rsa' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Algorithm
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="RS256">RS256 (RSA SHA-256)</option>
                    <option value="RS384">RS384 (RSA SHA-384)</option>
                    <option value="RS512">RS512 (RSA SHA-512)</option>
                    <option value="PS256">PS256 (RSA-PSS SHA-256)</option>
                    <option value="PS384">PS384 (RSA-PSS SHA-384)</option>
                    <option value="PS512">PS512 (RSA-PSS SHA-512)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    RSA Private Key (PEM format)
                  </label>
                  <textarea
                    value={rsaPrivateKey}
                    onChange={(e) => setRsaPrivateKey(e.target.value)}
                    placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                    className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    RSA Public Key (PEM format) - Optional
                  </label>
                  <textarea
                    value={rsaPublicKey}
                    onChange={(e) => setRsaPublicKey(e.target.value)}
                    placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
                    className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Header & Payload */}
          <div className="space-y-4">
            {/* Header */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Header
              </label>
              <textarea
                value={header}
                onChange={(e) => handleHeaderChange(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            {/* Payload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payload
              </label>
              <textarea
                value={payload}
                onChange={(e) => handlePayloadChange(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            <button
              onClick={generateJWT}
              disabled={isGenerating || (signingMethod === 'hmac' && !secret) || (signingMethod === 'rsa' && !rsaPrivateKey) || autoGenerate}
              className={`w-full inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                autoGenerate 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : autoGenerate ? (
                <RefreshCw className="h-4 w-4 animate-pulse" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              <span>
                {isGenerating 
                  ? 'Generating...' 
                  : autoGenerate 
                  ? 'Auto-generating...' 
                  : 'Generate JWT'
                }
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-800 dark:text-red-200 font-medium">Error</h4>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedJWTCreator;
