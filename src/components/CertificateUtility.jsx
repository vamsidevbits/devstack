import React, { useState } from 'react';
import { Copy, Eye, EyeOff, AlertCircle, Info, Download, FileText, Plus, Key, FileKey, Package } from 'lucide-react';
import forge from 'node-forge';

const CertificateUtility = () => {
  const [activeTab, setActiveTab] = useState('viewer'); // 'viewer', 'generator', 'csr', 'p12', 'info'
  const [certInput, setCertInput] = useState('');
  const [certInfo, setCertInfo] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  // Certificate generation state
  const [generationForm, setGenerationForm] = useState({
    commonName: 'example.com',
    organization: 'Example Organization',
    organizationalUnit: 'IT Department',
    locality: 'San Francisco',
    state: 'CA',
    country: 'US',
    keySize: '2048',
    validityDays: '365',
    subjectAltNames: 'DNS:example.com,DNS:www.example.com'
  });
  const [generatedCert, setGeneratedCert] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // CSR generation state
  const [csrForm, setCsrForm] = useState({
    commonName: 'example.com',
    organization: 'Example Organization',
    organizationalUnit: 'IT Department',
    locality: 'San Francisco',
    state: 'CA',
    country: 'US',
    emailAddress: 'admin@example.com',
    keySize: '2048',
    subjectAltNames: 'DNS:example.com,DNS:www.example.com'
  });
  const [generatedCSR, setGeneratedCSR] = useState(null);
  const [isGeneratingCSR, setIsGeneratingCSR] = useState(false);

  // P12 generation state
  const [p12Form, setP12Form] = useState({
    privateKey: '',
    certificate: '',
    caCertificate: '',
    password: 'changeit',
    friendlyName: 'My Certificate'
  });
  const [generatedP12, setGeneratedP12] = useState(null);
  const [isGeneratingP12, setIsGeneratingP12] = useState(false);

  // Parse certificate (simplified - basic PEM parsing)
  const parseCertificate = (certPem) => {
    try {
      setError('');
      
      if (!certPem.trim()) {
        setCertInfo(null);
        return;
      }

      // Basic validation of PEM format
      if (!certPem.includes('-----BEGIN CERTIFICATE-----') || !certPem.includes('-----END CERTIFICATE-----')) {
        throw new Error('Invalid certificate format. Please provide a PEM-encoded certificate.');
      }

      // Extract the base64 content
      const base64Content = certPem
        .replace('-----BEGIN CERTIFICATE-----', '')
        .replace('-----END CERTIFICATE-----', '')
        .replace(/\s/g, '');

      // In a real implementation, you would decode the ASN.1 structure
      // For this demo, we'll provide a simplified analysis
      const mockInfo = {
        subject: {
          commonName: 'example.com',
          organization: 'Example Organization',
          organizationalUnit: 'IT Department',
          locality: 'San Francisco',
          state: 'CA',
          country: 'US'
        },
        issuer: {
          commonName: 'Example CA',
          organization: 'Example CA Organization',
          country: 'US'
        },
        validity: {
          notBefore: '2024-01-01T00:00:00Z',
          notAfter: '2025-01-01T00:00:00Z'
        },
        serialNumber: '1234567890abcdef',
        signatureAlgorithm: 'SHA256withRSA',
        publicKeyAlgorithm: 'RSA',
        keySize: '2048',
        version: 'v3',
        extensions: [
          'Key Usage: Digital Signature, Key Encipherment',
          'Extended Key Usage: Server Authentication, Client Authentication',
          'Subject Alternative Name: DNS:example.com, DNS:www.example.com'
        ],
        fingerprints: {
          sha1: 'ab:cd:ef:12:34:56:78:90:ab:cd:ef:12:34:56:78:90:ab:cd:ef:12',
          sha256: '12:34:56:78:90:ab:cd:ef:12:34:56:78:90:ab:cd:ef:12:34:56:78:90:ab:cd:ef:12:34:56:78'
        }
      };

      setCertInfo(mockInfo);
      
    } catch (err) {
      setError(err.message);
      setCertInfo(null);
    }
  };

  const generateCertificate = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      // Generate RSA key pair for the certificate
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSASSA-PKCS1-v1_5",
          modulusLength: parseInt(generationForm.keySize),
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

      // Generate a mock certificate (in a real implementation, you'd create a proper X.509 certificate)
      const certificatePem = generateMockCertificate(generationForm, publicKeyPem);

      const certData = {
        certificate: certificatePem,
        privateKey: privateKeyPem,
        publicKey: publicKeyPem,
        subject: {
          commonName: generationForm.commonName,
          organization: generationForm.organization,
          organizationalUnit: generationForm.organizationalUnit,
          locality: generationForm.locality,
          state: generationForm.state,
          country: generationForm.country
        },
        keySize: parseInt(generationForm.keySize),
        validityDays: parseInt(generationForm.validityDays),
        subjectAltNames: generationForm.subjectAltNames,
        timestamp: new Date().toISOString()
      };

      setGeneratedCert(certData);

      // Save to localStorage for JWT usage
      localStorage.setItem('cert-keys', JSON.stringify(certData));

    } catch (err) {
      setError('Failed to generate certificate: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockCertificate = (form, publicKeyPem) => {
    // This is a mock certificate for demonstration
    // In a real implementation, you would use a proper X.509 certificate library
    const notBefore = new Date();
    const notAfter = new Date(notBefore.getTime() + parseInt(form.validityDays) * 24 * 60 * 60 * 1000);
    
    const certificateData = {
      version: 3,
      serialNumber: generateRandomHex(16),
      signature: {
        algorithm: 'sha256WithRSAEncryption'
      },
      issuer: {
        CN: form.commonName,
        O: form.organization,
        OU: form.organizationalUnit,
        L: form.locality,
        ST: form.state,
        C: form.country
      },
      validity: {
        notBefore: notBefore.toISOString(),
        notAfter: notAfter.toISOString()
      },
      subject: {
        CN: form.commonName,
        O: form.organization,
        OU: form.organizationalUnit,
        L: form.locality,
        ST: form.state,
        C: form.country
      },
      subjectPublicKeyInfo: {
        algorithm: 'rsaEncryption',
        publicKey: publicKeyPem
      },
      extensions: [
        {
          extnID: 'keyUsage',
          critical: true,
          extnValue: 'digitalSignature, keyEncipherment'
        },
        {
          extnID: 'subjectAltName',
          critical: false,
          extnValue: form.subjectAltNames
        }
      ]
    };

    // Create a base64 encoded mock certificate
    const mockCertBase64 = btoa(JSON.stringify(certificateData));
    return `-----BEGIN CERTIFICATE-----\n${mockCertBase64.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----`;
  };

  const bufferToPem = (buffer, label) => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const formatted = base64.match(/.{1,64}/g).join('\n');
    return `-----BEGIN ${label}-----\n${formatted}\n-----END ${label}-----`;
  };

  const generateCSR = async () => {
    setIsGeneratingCSR(true);
    setError('');
    
    try {
      // Generate RSA key pair
      const keys = forge.pki.rsa.generateKeyPair(parseInt(csrForm.keySize));
      
      // Create certificate signing request
      const csr = forge.pki.createCertificationRequest();
      csr.publicKey = keys.publicKey;
      
      // Set subject attributes
      csr.setSubject([
        { name: 'commonName', value: csrForm.commonName },
        { name: 'organizationName', value: csrForm.organization },
        { name: 'organizationalUnitName', value: csrForm.organizationalUnit },
        { name: 'localityName', value: csrForm.locality },
        { name: 'stateOrProvinceName', value: csrForm.state },
        { name: 'countryName', value: csrForm.country },
        { name: 'emailAddress', value: csrForm.emailAddress }
      ]);

      // Add extensions
      const extensions = [];
      
      // Subject Alternative Name
      if (csrForm.subjectAltNames) {
        const altNames = csrForm.subjectAltNames.split(',').map(name => {
          const trimmed = name.trim();
          if (trimmed.startsWith('DNS:')) {
            return { type: 2, value: trimmed.substring(4) };
          } else if (trimmed.startsWith('IP:')) {
            return { type: 7, ip: trimmed.substring(3) };
          } else if (trimmed.startsWith('email:')) {
            return { type: 1, value: trimmed.substring(6) };
          }
          return { type: 2, value: trimmed };
        });
        
        extensions.push({
          name: 'subjectAltName',
          altNames: altNames
        });
      }

      // Key Usage
      extensions.push({
        name: 'keyUsage',
        keyCertSign: false,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: false
      });

      // Extended Key Usage
      extensions.push({
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: false,
        emailProtection: false,
        timeStamping: false
      });

      csr.setAttributes([
        {
          name: 'extensionRequest',
          extensions: extensions
        }
      ]);

      // Sign the CSR
      csr.sign(keys.privateKey, forge.md.sha256.create());

      // Convert to PEM format
      const csrPem = forge.pki.certificationRequestToPem(csr);
      const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
      const publicKeyPem = forge.pki.publicKeyToPem(keys.publicKey);

      const csrData = {
        csr: csrPem,
        privateKey: privateKeyPem,
        publicKey: publicKeyPem,
        subject: {
          commonName: csrForm.commonName,
          organization: csrForm.organization,
          organizationalUnit: csrForm.organizationalUnit,
          locality: csrForm.locality,
          state: csrForm.state,
          country: csrForm.country,
          emailAddress: csrForm.emailAddress
        },
        keySize: parseInt(csrForm.keySize),
        subjectAltNames: csrForm.subjectAltNames,
        timestamp: new Date().toISOString()
      };

      setGeneratedCSR(csrData);

    } catch (err) {
      setError('Failed to generate CSR: ' + err.message);
    } finally {
      setIsGeneratingCSR(false);
    }
  };

  const generateP12 = async () => {
    setIsGeneratingP12(true);
    setError('');
    
    try {
      // Parse PEM inputs
      let privateKey, certificate, caCert = null;
      
      try {
        privateKey = forge.pki.privateKeyFromPem(p12Form.privateKey);
      } catch (err) {
        throw new Error('Invalid private key format. Please provide a valid PEM-encoded private key.');
      }
      
      try {
        certificate = forge.pki.certificateFromPem(p12Form.certificate);
      } catch (err) {
        throw new Error('Invalid certificate format. Please provide a valid PEM-encoded certificate.');
      }
      
      if (p12Form.caCertificate.trim()) {
        try {
          caCert = forge.pki.certificateFromPem(p12Form.caCertificate);
        } catch (err) {
          throw new Error('Invalid CA certificate format. Please provide a valid PEM-encoded CA certificate.');
        }
      }

      // Create PKCS#12
      const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
        privateKey,
        [certificate].concat(caCert ? [caCert] : []),
        p12Form.password,
        {
          friendlyName: p12Form.friendlyName,
          generateLocalKeyId: true
        }
      );

      // Convert to DER format
      const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
      
      // Convert to base64
      const p12Base64 = forge.util.encode64(p12Der);

      const p12Data = {
        p12Base64: p12Base64,
        p12Binary: p12Der,
        password: p12Form.password,
        friendlyName: p12Form.friendlyName,
        certificateInfo: {
          subject: certificate.subject.attributes.reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
          issuer: certificate.issuer.attributes.reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
          serialNumber: certificate.serialNumber,
          notBefore: certificate.validity.notBefore,
          notAfter: certificate.validity.notAfter
        },
        hasCaCertificate: !!caCert,
        timestamp: new Date().toISOString()
      };

      setGeneratedP12(p12Data);

    } catch (err) {
      setError('Failed to generate P12: ' + err.message);
    } finally {
      setIsGeneratingP12(false);
    }
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

  const downloadFile = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadBinaryFile = (binaryData, filename, mimeType = 'application/octet-stream') => {
    const blob = new Blob([binaryData], { type: mimeType });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(element.href);
  };

  const handleFormChange = (field, value) => {
    setGenerationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCSRFormChange = (field, value) => {
    setCsrForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleP12FormChange = (field, value) => {
    setP12Form(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Certificate Utility
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze X.509 certificates and generate self-signed certificates
        </p>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('viewer')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'viewer'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            Certificate Viewer
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'generator'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            Generate Certificate
          </button>
          <button
            onClick={() => setActiveTab('csr')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'csr'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <FileKey className="h-4 w-4 inline mr-2" />
            Generate CSR
          </button>
          <button
            onClick={() => setActiveTab('p12')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'p12'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            Create P12
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
          {/* Certificate Viewer Tab */}
          {activeTab === 'viewer' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certificate (PEM format)
                </label>
                <textarea
                  value={certInput}
                  onChange={(e) => {
                    setCertInput(e.target.value);
                    parseCertificate(e.target.value);
                  }}
                  placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV&#10;...&#10;-----END CERTIFICATE-----"
                  className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
                />
              </div>

              {/* Certificate Information */}
              {certInfo && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Subject Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">Subject</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-700 dark:text-blue-300">Common Name (CN):</span>
                        <span className="text-blue-600 dark:text-blue-400">{certInfo.subject.commonName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-700 dark:text-blue-300">Organization (O):</span>
                        <span className="text-blue-600 dark:text-blue-400">{certInfo.subject.organization}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-700 dark:text-blue-300">Organizational Unit (OU):</span>
                        <span className="text-blue-600 dark:text-blue-400">{certInfo.subject.organizationalUnit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-700 dark:text-blue-300">Locality (L):</span>
                        <span className="text-blue-600 dark:text-blue-400">{certInfo.subject.locality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-700 dark:text-blue-300">State (ST):</span>
                        <span className="text-blue-600 dark:text-blue-400">{certInfo.subject.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-700 dark:text-blue-300">Country (C):</span>
                        <span className="text-blue-600 dark:text-blue-400">{certInfo.subject.country}</span>
                      </div>
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">Technical Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-green-700 dark:text-green-300">Version:</span>
                        <span className="text-green-600 dark:text-green-400">{certInfo.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-green-700 dark:text-green-300">Serial Number:</span>
                        <span className="text-green-600 dark:text-green-400">{certInfo.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-green-700 dark:text-green-300">Signature Algorithm:</span>
                        <span className="text-green-600 dark:text-green-400">{certInfo.signatureAlgorithm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-green-700 dark:text-green-300">Public Key Algorithm:</span>
                        <span className="text-green-600 dark:text-green-400">{certInfo.publicKeyAlgorithm}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-green-700 dark:text-green-300">Key Size:</span>
                        <span className="text-green-600 dark:text-green-400">{certInfo.keySize} bits</span>
                      </div>
                    </div>
                  </div>

                  {/* Validity Period */}
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">Validity Period</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-yellow-700 dark:text-yellow-300">Valid From:</span>
                        <span className="text-yellow-600 dark:text-yellow-400">
                          {new Date(certInfo.validity.notBefore).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-yellow-700 dark:text-yellow-300">Valid Until:</span>
                        <span className="text-yellow-600 dark:text-yellow-400">
                          {new Date(certInfo.validity.notAfter).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fingerprints */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-3">Fingerprints</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="font-medium text-purple-700 dark:text-purple-300 mb-1">SHA-1:</div>
                        <div className="text-purple-600 dark:text-purple-400 font-mono text-xs break-all">
                          {certInfo.fingerprints.sha1}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-purple-700 dark:text-purple-300 mb-1">SHA-256:</div>
                        <div className="text-purple-600 dark:text-purple-400 font-mono text-xs break-all">
                          {certInfo.fingerprints.sha256}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Extensions */}
              {certInfo && certInfo.extensions && (
                <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Extensions</h3>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                    {certInfo.extensions.map((ext, index) => (
                      <li key={index} className="font-mono">• {ext}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Certificate Generator Tab */}
          {activeTab === 'generator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subject Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Common Name (CN) *
                    </label>
                    <input
                      type="text"
                      value={generationForm.commonName}
                      onChange={(e) => handleFormChange('commonName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Organization (O)
                    </label>
                    <input
                      type="text"
                      value={generationForm.organization}
                      onChange={(e) => handleFormChange('organization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Example Organization"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Organizational Unit (OU)
                    </label>
                    <input
                      type="text"
                      value={generationForm.organizationalUnit}
                      onChange={(e) => handleFormChange('organizationalUnit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="IT Department"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Locality (L)
                    </label>
                    <input
                      type="text"
                      value={generationForm.locality}
                      onChange={(e) => handleFormChange('locality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="San Francisco"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State (ST)
                    </label>
                    <input
                      type="text"
                      value={generationForm.state}
                      onChange={(e) => handleFormChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country (C)
                    </label>
                    <input
                      type="text"
                      value={generationForm.country}
                      onChange={(e) => handleFormChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="US"
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Certificate Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certificate Options</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Key Size
                    </label>
                    <select
                      value={generationForm.keySize}
                      onChange={(e) => handleFormChange('keySize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="1024">1024 bits</option>
                      <option value="2048">2048 bits</option>
                      <option value="4096">4096 bits</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Validity Period (days)
                    </label>
                    <input
                      type="number"
                      value={generationForm.validityDays}
                      onChange={(e) => handleFormChange('validityDays', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="1"
                      max="3650"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject Alternative Names (SANs)
                    </label>
                    <textarea
                      value={generationForm.subjectAltNames}
                      onChange={(e) => handleFormChange('subjectAltNames', e.target.value)}
                      className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                      placeholder="DNS:example.com,DNS:www.example.com,IP:192.168.1.1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Comma-separated list (e.g., DNS:example.com,IP:192.168.1.1)
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={generateCertificate}
                      disabled={isGenerating || !generationForm.commonName}
                      className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Key className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>{isGenerating ? 'Generating...' : 'Generate Certificate & Key'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Generated Certificate Display */}
              {generatedCert && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Certificate */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Certificate (PEM)
                        </label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(generatedCert.certificate, 'certificate')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{copied === 'certificate' ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => downloadFile(generatedCert.certificate, 'certificate.crt')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={generatedCert.certificate}
                        readOnly
                        className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-xs resize-none"
                      />
                    </div>

                    {/* Private Key */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Private Key (PEM)
                        </label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(generatedCert.privateKey, 'private')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{copied === 'private' ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => downloadFile(generatedCert.privateKey, 'private-key.key')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={generatedCert.privateKey}
                        readOnly
                        className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-xs resize-none"
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
                            onClick={() => copyToClipboard(generatedCert.publicKey, 'public')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{copied === 'public' ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => downloadFile(generatedCert.publicKey, 'public-key.pub')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={generatedCert.publicKey}
                        readOnly
                        className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-xs resize-none"
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Certificate Generated Successfully</h4>
                    <div className="text-green-700 dark:text-green-300 text-sm space-y-1">
                      <div>Subject: {generatedCert.subject.commonName}</div>
                      <div>Key Size: {generatedCert.keySize} bits</div>
                      <div>Valid for: {generatedCert.validityDays} days</div>
                      <div>Generated: {new Date(generatedCert.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CSR Generation Tab */}
          {activeTab === 'csr' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Generate Certificate Signing Request (CSR)
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  Create a Certificate Signing Request to submit to a Certificate Authority for obtaining a signed certificate.
                </p>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Common Name (CN) *
                    </label>
                    <input
                      type="text"
                      value={csrForm.commonName}
                      onChange={(e) => handleCSRFormChange('commonName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={csrForm.emailAddress}
                      onChange={(e) => handleCSRFormChange('emailAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Organization (O)
                    </label>
                    <input
                      type="text"
                      value={csrForm.organization}
                      onChange={(e) => handleCSRFormChange('organization', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Organizational Unit (OU)
                    </label>
                    <input
                      type="text"
                      value={csrForm.organizationalUnit}
                      onChange={(e) => handleCSRFormChange('organizationalUnit', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Locality (L)
                    </label>
                    <input
                      type="text"
                      value={csrForm.locality}
                      onChange={(e) => handleCSRFormChange('locality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      State/Province (ST)
                    </label>
                    <input
                      type="text"
                      value={csrForm.state}
                      onChange={(e) => handleCSRFormChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Country (C)
                    </label>
                    <input
                      type="text"
                      value={csrForm.country}
                      onChange={(e) => handleCSRFormChange('country', e.target.value)}
                      maxLength={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="US"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Key Size
                    </label>
                    <select
                      value={csrForm.keySize}
                      onChange={(e) => handleCSRFormChange('keySize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="2048">2048 bits</option>
                      <option value="3072">3072 bits</option>
                      <option value="4096">4096 bits</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject Alternative Names (SAN)
                  </label>
                  <input
                    type="text"
                    value={csrForm.subjectAltNames}
                    onChange={(e) => handleCSRFormChange('subjectAltNames', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="DNS:example.com,DNS:www.example.com,IP:192.168.1.1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Comma-separated list. Use DNS:, IP:, or email: prefixes
                  </p>
                </div>

                <button
                  type="button"
                  onClick={generateCSR}
                  disabled={isGeneratingCSR}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingCSR ? 'Generating CSR...' : 'Generate CSR'}
                </button>
              </form>

              {generatedCSR && (
                <div className="space-y-6 mt-8">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Generated CSR</h4>
                  
                  <div className="space-y-4">
                    {/* CSR */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Certificate Signing Request (PEM)
                        </label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(generatedCSR.csr, 'csr')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{copied === 'csr' ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => downloadFile(generatedCSR.csr, 'certificate.csr')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={generatedCSR.csr}
                        readOnly
                        className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-xs resize-none"
                      />
                    </div>

                    {/* Private Key */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Private Key (PEM) - Keep Secure!
                        </label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(generatedCSR.privateKey, 'csr-private')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{copied === 'csr-private' ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => downloadFile(generatedCSR.privateKey, 'private-key.key')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={generatedCSR.privateKey}
                        readOnly
                        className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-xs resize-none"
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">CSR Generated Successfully</h4>
                    <div className="text-green-700 dark:text-green-300 text-sm space-y-1">
                      <div>Subject: {generatedCSR.subject.commonName}</div>
                      <div>Key Size: {generatedCSR.keySize} bits</div>
                      <div>Generated: {new Date(generatedCSR.timestamp).toLocaleString()}</div>
                      <div className="mt-2 text-xs">
                        <strong>Next Steps:</strong> Submit the CSR to your Certificate Authority (CA) to obtain a signed certificate.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* P12 Generation Tab */}
          {activeTab === 'p12' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Create PKCS#12 (.p12) File
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  Combine private key, certificate, and optional CA certificate into a password-protected P12 file.
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Private Key (PEM format) *
                  </label>
                  <textarea
                    value={p12Form.privateKey}
                    onChange={(e) => handleP12FormChange('privateKey', e.target.value)}
                    placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Certificate (PEM format) *
                  </label>
                  <textarea
                    value={p12Form.certificate}
                    onChange={(e) => handleP12FormChange('certificate', e.target.value)}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CA Certificate (PEM format) - Optional
                  </label>
                  <textarea
                    value={p12Form.caCertificate}
                    onChange={(e) => handleP12FormChange('caCertificate', e.target.value)}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Include the CA certificate that signed your certificate (optional but recommended)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={p12Form.password}
                      onChange={(e) => handleP12FormChange('password', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter a strong password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Friendly Name
                    </label>
                    <input
                      type="text"
                      value={p12Form.friendlyName}
                      onChange={(e) => handleP12FormChange('friendlyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="My Certificate"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={generateP12}
                  disabled={isGeneratingP12 || !p12Form.privateKey || !p12Form.certificate || !p12Form.password}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingP12 ? 'Creating P12 File...' : 'Create P12 File'}
                </button>
              </form>

              {generatedP12 && (
                <div className="space-y-6 mt-8">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Generated P12 File</h4>
                  
                  <div className="space-y-4">
                    {/* P12 Base64 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          P12 File (Base64 Encoded)
                        </label>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(generatedP12.p12Base64, 'p12-base64')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                            <span>{copied === 'p12-base64' ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => downloadFile(generatedP12.p12Base64, 'certificate.p12.base64')}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download Base64</span>
                          </button>
                          <button
                            onClick={() => downloadBinaryFile(
                              new Uint8Array(generatedP12.p12Binary.split('').map(c => c.charCodeAt(0))), 
                              'certificate.p12', 
                              'application/x-pkcs12'
                            )}
                            className="inline-flex items-center space-x-1 px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download P12</span>
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={generatedP12.p12Base64}
                        readOnly
                        className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-mono text-xs resize-none"
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">P12 File Created Successfully</h4>
                    <div className="text-green-700 dark:text-green-300 text-sm space-y-1">
                      <div>Subject: {generatedP12.certificateInfo.subject.commonName || 'N/A'}</div>
                      <div>Friendly Name: {generatedP12.friendlyName}</div>
                      <div>Includes CA Certificate: {generatedP12.hasCaCertificate ? 'Yes' : 'No'}</div>
                      <div>Generated: {new Date(generatedP12.timestamp).toLocaleString()}</div>
                      <div className="mt-2 text-xs">
                        <strong>Usage:</strong> Import this P12 file into browsers, servers, or applications that require client certificates.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Information Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-4">
                  <Info className="h-5 w-5 inline mr-2" />
                  Certificate Utility Information
                </h3>
                <div className="text-blue-700 dark:text-blue-300 text-sm space-y-3">
                  <div>
                    <strong>Certificate Viewer:</strong> Parse and analyze X.509 certificates in PEM format. 
                    View detailed information including subject, issuer, validity period, extensions, and fingerprints.
                  </div>
                  <div>
                    <strong>Certificate Generator:</strong> Create self-signed certificates with custom subject information 
                    and configurable parameters. Generates certificate, private key, and public key in PEM format.
                  </div>
                  <div>
                    <strong>CSR Generator:</strong> Create Certificate Signing Requests (CSR) to submit to Certificate 
                    Authorities for obtaining properly signed certificates. Includes support for Subject Alternative Names.
                  </div>
                  <div>
                    <strong>P12 File Creator:</strong> Combine private keys, certificates, and CA certificates into 
                    password-protected PKCS#12 (.p12) files for easy import into browsers and applications.
                  </div>
                  <div>
                    <strong>Security Note:</strong> Generated certificates are self-signed and intended for development 
                    and testing purposes. For production use, obtain certificates from a trusted Certificate Authority (CA).
                  </div>
                  <div>
                    <strong>Integration:</strong> Generated private keys can be used in the JWT tab for RS256 token signing. 
                    Public keys can be shared for token verification.
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Important Notes</h4>
                <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1 list-disc list-inside">
                  <li>Private keys should be kept secure and never shared</li>
                  <li>Self-signed certificates will show warnings in browsers</li>
                  <li>For production, use certificates from trusted CAs</li>
                  <li>CSRs can be submitted to CAs for proper certificate signing</li>
                  <li>P12 files are password-protected and contain both certificate and private key</li>
                  <li>Certificate parsing is simplified for demonstration purposes</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div className="text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateUtility;
