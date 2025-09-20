import React, { useState } from 'react';
import { Copy, RefreshCw, Key, Download, Info, Trash2 } from 'lucide-react';

const KeyGenerator = () => {
  const [activeTab, setActiveTab] = useState('rsa');
  const [keySize, setKeySize] = useState('2048');
  const [generatedKeys, setGeneratedKeys] = useState(null);
  const [jwks, setJwks] = useState(null);
  const [secretKey, setSecretKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [keyName, setKeyName] = useState('');
  const [savedKeys, setSavedKeys] = useState({});

  // Generate RSA Key Pair with JWKS
  const generateRSAKeyPair = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: parseInt(keySize),
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
      );

      // Export private key to PEM
      const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
      const privateKeyPem = bufferToPem(privateKeyBuffer, 'PRIVATE KEY');

      // Export public key to PEM
      const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
      const publicKeyPem = bufferToPem(publicKeyBuffer, 'PUBLIC KEY');

      // Export to JWK format for JWKS
      const privateKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
      const publicKeyJwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);

      // Generate key ID
      const kid = generateRandomString(8);
      
      // Create JWKS (JSON Web Key Set)
      const publicJwks = {
        keys: [
          {
            ...publicKeyJwk,
            kid: kid,
            alg: 'RS256',
            use: 'sig'
          }
        ]
      };

      const privateJwks = {
        keys: [
          {
            ...privateKeyJwk,
            kid: kid,
            alg: 'RS256',
            use: 'sig'
          }
        ]
      };

      setGeneratedKeys({
        privateKeyPem,
        publicKeyPem,
        keySize: parseInt(keySize),
        kid
      });

      setJwks({
        public: publicJwks,
        private: privateJwks
      });

      // Save to localStorage for JWT usage
      const keyData = {
        privateKey: privateKeyPem,
        publicKey: publicKeyPem,
        kid,
        keySize: parseInt(keySize),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('rsa-keys', JSON.stringify(keyData));

    } catch (err) {
      setError('Failed to generate RSA key pair: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate HMAC Secret Key
  const generateSecretKey = () => {
    const length = 64; // 512 bits
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    const secret = btoa(String.fromCharCode.apply(null, array));
    setSecretKey(secret);
    
    // Save to localStorage for JWT usage
    localStorage.setItem('hmac-secret', secret);
  };

  // Helper functions
  const bufferToPem = (buffer, label) => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const formatted = base64.match(/.{1,64}/g).join('\n');
    return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
  };

  const generateRandomString = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const values = new Uint8Array(length);
    window.crypto.getRandomValues(values);
    
    for (let i = 0; i < length; i++) {
      result += charset[values[i] % charset.length];
    }
    return result;
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const downloadFile = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  React.useEffect(() => {
    if (activeTab === 'secret') {
      generateSecretKey();
    }
    loadSavedKeys();
  }, [activeTab]);

  const loadSavedKeys = () => {
    const keys = {};
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
    setSavedKeys(keys);
  };

  const saveKeyWithName = (keyData, keyType, name) => {
    if (!name.trim()) {
      setError('Please provide a name for the key');
      return;
    }

    const sanitizedName = name.trim().replace(/[^a-zA-Z0-9-_]/g, '_');
    const saveData = {
      ...keyData,
      type: keyType,
      name: name.trim(),
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`saved-key-${sanitizedName}`, JSON.stringify(saveData));
    setKeyName('');
    loadSavedKeys();
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Key Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate RSA key pairs, JWKS, and HMAC secrets for JWT signing
        </p>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('rsa')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'rsa'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Key className="h-4 w-4 inline mr-2" />
            RSA Keys & JWKS
          </button>
          <button
            onClick={() => setActiveTab('secret')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'secret'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            HMAC Secret
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Key className="h-4 w-4 inline mr-2" />
            Saved Keys
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Info className="h-4 w-4 inline mr-2" />
            Information
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'rsa' && (
            <div className="space-y-6">
              {/* RSA Key Generation Controls */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Key Size
                  </label>
                  <select
                    value={keySize}
                    onChange={(e) => setKeySize(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="1024">1024 bits</option>
                    <option value="2048">2048 bits</option>
                    <option value="4096">4096 bits</option>
                  </select>
                </div>
                <button
                  onClick={generateRSAKeyPair}
                  disabled={isGenerating}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Generating...' : 'Generate RSA Key Pair'}</span>
                </button>
              </div>

              {/* Generated Keys Display */}
              {generatedKeys && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Private Key */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Private Key (PEM)
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(generatedKeys.privateKeyPem, 'private')}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copied === 'private' ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => downloadFile(generatedKeys.privateKeyPem, 'private-key.pem')}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={generatedKeys.privateKeyPem}
                      readOnly
                      className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-sm resize-none"
                    />
                  </div>

                  {/* Public Key */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Public Key (PEM)
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(generatedKeys.publicKeyPem, 'public')}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copied === 'public' ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => downloadFile(generatedKeys.publicKeyPem, 'public-key.pem')}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={generatedKeys.publicKeyPem}
                      readOnly
                      className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {/* JWKS Display */}
              {jwks && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Public JWKS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Public JWKS (for sharing)
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(jwks.public, null, 2), 'public-jwks')}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copied === 'public-jwks' ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => downloadFile(JSON.stringify(jwks.public, null, 2), 'public-jwks.json')}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={JSON.stringify(jwks.public, null, 2)}
                      readOnly
                      className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-sm resize-none"
                    />
                  </div>

                  {/* Private JWKS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Private JWKS (keep secret)
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(jwks.private, null, 2), 'private-jwks')}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copied === 'private-jwks' ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => downloadFile(JSON.stringify(jwks.private, null, 2), 'private-jwks.json')}
                          className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={JSON.stringify(jwks.private, null, 2)}
                      readOnly
                      className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Key Info */}
              {generatedKeys && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Key Information</h4>
                    <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
                      <div>Key Size: {generatedKeys.keySize} bits</div>
                      <div>Key ID (kid): {generatedKeys.kid}</div>
                      <div>Algorithm: RS256 (RSASSA-PKCS1-v1_5 with SHA-256)</div>
                      <div>Use: Signature (sig)</div>
                    </div>
                  </div>

                  {/* Save Key with Name */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">Save Key</h4>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        placeholder="Enter key name (e.g., 'production-rsa')"
                        className="flex-1 px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-green-800 text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        onClick={() => saveKeyWithName({
                          privateKey: generatedKeys.privateKeyPem,
                          publicKey: generatedKeys.publicKeyPem,
                          kid: generatedKeys.kid,
                          keySize: generatedKeys.keySize,
                          jwks: jwks
                        }, 'RSA', keyName)}
                        disabled={!keyName.trim()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-green-700 dark:text-green-300 text-xs mt-2">
                      Saved keys can be used in the JWT tab for token signing
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'secret' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  HMAC Secret Key
                </h3>
                <button
                  onClick={generateSecretKey}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Generate New Secret</span>
                </button>
              </div>

              {secretKey && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Secret Key (Base64)
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(secretKey, 'secret')}
                        className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        <span>{copied === 'secret' ? 'Copied!' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => downloadFile(secretKey, 'hmac-secret.txt')}
                        className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={secretKey}
                    readOnly
                    className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-sm resize-none"
                  />
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Security Note</h4>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  This HMAC secret is generated using cryptographically secure random values. 
                  Keep this secret secure and never share it publicly. Use this for HS256, HS384, or HS512 JWT signing.
                </p>
              </div>

              {/* Save HMAC Secret */}
              {secretKey && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-3">Save Secret</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder="Enter secret name (e.g., 'production-hmac')"
                      className="flex-1 px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-green-800 text-gray-900 dark:text-white text-sm"
                    />
                    <button
                      onClick={() => saveKeyWithName({
                        secret: secretKey
                      }, 'HMAC', keyName)}
                      disabled={!keyName.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Save
                    </button>
                  </div>
                  <p className="text-green-700 dark:text-green-300 text-xs mt-2">
                    Saved secrets can be used in the JWT tab for token signing
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Saved Keys & Secrets
                </h3>
                <button
                  onClick={loadSavedKeys}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>

              {Object.keys(savedKeys).length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No saved keys yet. Generate and save keys from the RSA or HMAC tabs.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(savedKeys).map(([keyId, keyData]) => (
                    <div key={keyId} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {keyData.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            keyData.type === 'RSA' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {keyData.type}
                          </span>
                          <button
                            onClick={() => {
                              localStorage.removeItem(`saved-key-${keyId}`);
                              loadSavedKeys();
                            }}
                            className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                            title="Delete key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {keyData.type === 'RSA' && (
                          <>
                            <div>Key Size: {keyData.keySize} bits</div>
                            <div>Key ID: {keyData.kid}</div>
                          </>
                        )}
                        <div>Saved: {new Date(keyData.timestamp).toLocaleDateString()}</div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        {keyData.type === 'RSA' && (
                          <>
                            <button
                              onClick={() => copyToClipboard(keyData.privateKey, `private-${keyId}`)}
                              className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                            >
                              Copy Private Key
                            </button>
                            <button
                              onClick={() => copyToClipboard(keyData.publicKey, `public-${keyId}`)}
                              className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                              Copy Public Key
                            </button>
                          </>
                        )}
                        {keyData.type === 'HMAC' && (
                          <button
                            onClick={() => copyToClipboard(keyData.secret, `secret-${keyId}`)}
                            className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Copy Secret
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-4">
                  <Info className="h-5 w-5 inline mr-2" />
                  Key Generator Information
                </h3>
                <div className="text-blue-700 dark:text-blue-300 text-sm space-y-3">
                  <div>
                    <strong>RSA Keys:</strong> Generated using Web Crypto API with RSASSA-PKCS1-v1_5 algorithm. 
                    Suitable for JWT signing with RS256 algorithm.
                  </div>
                  <div>
                    <strong>JWKS:</strong> JSON Web Key Set format for easy integration with JWT libraries. 
                    Public JWKS can be shared for token verification, private JWKS should be kept secure.
                  </div>
                  <div>
                    <strong>HMAC Secret:</strong> 512-bit cryptographically secure random key for symmetric JWT signing 
                    using HS256, HS384, or HS512 algorithms.
                  </div>
                  <div>
                    <strong>Integration:</strong> Generated keys are automatically saved to browser storage 
                    and can be used directly in the JWT tab for token creation and verification.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyGenerator;
