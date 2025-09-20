import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Copy, Eye, FileText, Download, AlertCircle, CheckCircle, ExternalLink, 
  Code, FileCode, Settings, RefreshCw, Layout, SplitSquareVertical, 
  Moon, Sun, Maximize, Minimize, Monitor, Edit3
} from 'lucide-react';
import Split from 'react-split';
import Editor from '@monaco-editor/react';
import jsYaml from 'js-yaml';

const SwaggerPreview = () => {
  const [swaggerInput, setSwaggerInput] = useState('');
  const [parsedSpec, setParsedSpec] = useState(null);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [copied, setCopied] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState(null);
  const [inputFormat, setInputFormat] = useState('yaml'); // 'json' or 'yaml'
  const [layout, setLayout] = useState('split'); // 'split', 'editor', 'preview'
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [isValidating, setIsValidating] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Sample Swagger/OpenAPI spec in YAML format for better readability
  const sampleSpecYaml = `openapi: 3.0.0
info:
  title: Sample API
  description: A sample API to demonstrate Swagger preview capabilities
  version: 1.0.0
  contact:
    name: API Support
    email: support@example.com
    url: https://example.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: https://staging-api.example.com/v1
    description: Staging server
  - url: http://localhost:3000/api/v1
    description: Local development server

tags:
  - name: Users
    description: User management operations
  - name: Posts
    description: Blog post operations

paths:
  /users:
    get:
      summary: Get all users
      description: Retrieve a paginated list of all users
      tags: [Users]
      parameters:
        - name: limit
          in: query
          description: Number of users to return (max 100)
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 10
        - name: offset
          in: query
          description: Number of users to skip
          required: false
          schema:
            type: integer
            minimum: 0
            default: 0
        - name: search
          in: query
          description: Search users by name or email
          required: false
          schema:
            type: string
            minLength: 2
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  users:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  total:
                    type: integer
                    description: Total number of users
                  hasMore:
                    type: boolean
                    description: Whether there are more users to fetch
        '400':
          description: Invalid parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '429':
          description: Rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    post:
      summary: Create a new user
      description: Create a new user in the system
      tags: [Users]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserInput'
            examples:
              john_doe:
                summary: Example user John Doe
                value:
                  name: John Doe
                  email: john.doe@example.com
                  role: user
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '409':
          description: User already exists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /users/{id}:
    get:
      summary: Get user by ID
      description: Retrieve a specific user by their unique identifier
      tags: [Users]
      parameters:
        - name: id
          in: path
          required: true
          description: User ID (UUID format)
          schema:
            type: string
            format: uuid
            example: 123e4567-e89b-12d3-a456-426614174000
      responses:
        '200':
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
    put:
      summary: Update user
      description: Update an existing user's information
      tags: [Users]
      parameters:
        - name: id
          in: path
          required: true
          description: User ID
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdate'
      responses:
        '200':
          description: User updated successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Invalid input
        '404':
          description: User not found
    delete:
      summary: Delete user
      description: Remove a user from the system
      tags: [Users]
      parameters:
        - name: id
          in: path
          required: true
          description: User ID
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: User deleted successfully
        '404':
          description: User not found

  /users/{id}/posts:
    get:
      summary: Get user's posts
      description: Retrieve all posts created by a specific user
      tags: [Users, Posts]
      parameters:
        - name: id
          in: path
          required: true
          description: User ID
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: User's posts retrieved successfully
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Post'

components:
  schemas:
    User:
      type: object
      description: User account information
      properties:
        id:
          type: string
          format: uuid
          description: Unique user identifier
          example: 123e4567-e89b-12d3-a456-426614174000
        name:
          type: string
          description: User's full name
          example: John Doe
          minLength: 2
          maxLength: 100
        email:
          type: string
          format: email
          description: User's email address
          example: john.doe@example.com
        role:
          type: string
          enum: [admin, moderator, user]
          description: User's role in the system
          default: user
        avatar:
          type: string
          format: uri
          description: URL to user's avatar image
          example: https://example.com/avatars/user123.jpg
        isActive:
          type: boolean
          description: Whether the user account is active
          default: true
        createdAt:
          type: string
          format: date-time
          description: User creation timestamp
          example: 2023-01-15T09:30:00Z
        updatedAt:
          type: string
          format: date-time
          description: Last update timestamp
          example: 2023-12-01T14:45:30Z
      required: [id, name, email, role, isActive, createdAt, updatedAt]

    UserInput:
      type: object
      description: Input data for creating a new user
      properties:
        name:
          type: string
          description: User's full name
          minLength: 2
          maxLength: 100
          example: John Doe
        email:
          type: string
          format: email
          description: User's email address
          example: john.doe@example.com
        role:
          type: string
          enum: [admin, moderator, user]
          description: User's role in the system
          default: user
        avatar:
          type: string
          format: uri
          description: URL to user's avatar image
      required: [name, email]

    UserUpdate:
      type: object
      description: Input data for updating an existing user
      properties:
        name:
          type: string
          description: User's full name
          minLength: 2
          maxLength: 100
        email:
          type: string
          format: email
          description: User's email address
        role:
          type: string
          enum: [admin, moderator, user]
          description: User's role in the system
        avatar:
          type: string
          format: uri
          description: URL to user's avatar image
        isActive:
          type: boolean
          description: Whether the user account is active

    Post:
      type: object
      description: Blog post information
      properties:
        id:
          type: string
          format: uuid
          description: Unique post identifier
        title:
          type: string
          description: Post title
          example: "Getting Started with OpenAPI"
        content:
          type: string
          description: Post content in markdown format
        authorId:
          type: string
          format: uuid
          description: ID of the post author
        tags:
          type: array
          items:
            type: string
          description: Post tags
          example: ["tutorial", "api", "openapi"]
        publishedAt:
          type: string
          format: date-time
          description: Publication timestamp
        updatedAt:
          type: string
          format: date-time
          description: Last update timestamp
      required: [id, title, content, authorId, publishedAt, updatedAt]

    Error:
      type: object
      description: Error response format
      properties:
        error:
          type: string
          description: Error code or type
          example: VALIDATION_ERROR
        message:
          type: string
          description: Human-readable error message
          example: The provided email address is invalid
        details:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
                description: Field that caused the error
              code:
                type: string
                description: Specific error code
              message:
                type: string
                description: Field-specific error message
          description: Detailed validation errors
        timestamp:
          type: string
          format: date-time
          description: Error timestamp
      required: [error, message, timestamp]

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

security:
  - BearerAuth: []
  - ApiKeyAuth: []`;

  const sampleSpecJson = JSON.stringify(jsYaml.load(sampleSpecYaml), null, 2);

  // Initialize with sample spec
  useEffect(() => {
    const initialSpec = inputFormat === 'yaml' ? sampleSpecYaml : sampleSpecJson;
    setSwaggerInput(initialSpec);
  }, []);

  // Parse and validate spec when input changes
  useEffect(() => {
    if (swaggerInput.trim()) {
      parseSwaggerSpec(swaggerInput);
    } else {
      setParsedSpec(null);
      setError('');
      setValidationErrors([]);
    }
  }, [swaggerInput, inputFormat]);

  const parseSwaggerSpec = useCallback(async (input) => {
    if (!input.trim()) return;
    
    setIsValidating(true);
    setError('');
    setValidationErrors([]);
    
    try {
      let spec;
      
      // Parse based on input format
      if (inputFormat === 'yaml') {
        try {
          spec = jsYaml.load(input);
        } catch (yamlError) {
          throw new Error(`YAML parsing error: ${yamlError.message}`);
        }
      } else {
        try {
          spec = JSON.parse(input);
        } catch (jsonError) {
          throw new Error(`JSON parsing error: ${jsonError.message}`);
        }
      }
      
      // Basic structure validation
      if (!spec.openapi && !spec.swagger) {
        throw new Error('Invalid OpenAPI/Swagger specification. Missing version field (openapi or swagger).');
      }
      
      if (!spec.info) {
        throw new Error('Invalid specification. Missing required "info" object.');
      }
      
      if (!spec.info.title) {
        throw new Error('Invalid specification. Missing required "info.title" field.');
      }
      
      if (!spec.info.version) {
        throw new Error('Invalid specification. Missing required "info.version" field.');
      }
      
      if (!spec.paths) {
        throw new Error('Invalid specification. Missing required "paths" object.');
      }

      // Additional client-side validation
      const warnings = [];
      
      // Check for common issues
      if (spec.openapi && !spec.openapi.startsWith('3.')) {
        warnings.push({
          type: 'warning',
          message: 'Consider using OpenAPI 3.x for better tooling support'
        });
      }
      
      // Check if paths are properly defined
      Object.entries(spec.paths).forEach(([path, pathItem]) => {
        if (typeof pathItem !== 'object') {
          warnings.push({
            type: 'warning',
            message: `Path "${path}" should be an object`
          });
        }
      });
      
      // Check for components schemas if referenced
      if (spec.components && spec.components.schemas) {
        const schemaNames = Object.keys(spec.components.schemas);
        const specString = JSON.stringify(spec);
        
        schemaNames.forEach(schemaName => {
          if (!specString.includes(`#/components/schemas/${schemaName}`)) {
            warnings.push({
              type: 'info',
              message: `Schema "${schemaName}" is defined but not referenced`
            });
          }
        });
      }

      setParsedSpec(spec);
      setValidationErrors(warnings);
      setError('');
    } catch (err) {
      setError(err.message);
      setParsedSpec(null);
    } finally {
      setIsValidating(false);
    }
  }, [inputFormat]);

  const loadSampleSpec = () => {
    const spec = inputFormat === 'yaml' ? sampleSpecYaml : sampleSpecJson;
    setSwaggerInput(spec);
  };

  const convertFormat = (targetFormat) => {
    if (!swaggerInput.trim()) {
      setInputFormat(targetFormat);
      return;
    }
    
    try {
      let spec;
      
      // Parse current format
      if (inputFormat === 'yaml') {
        spec = jsYaml.load(swaggerInput);
      } else {
        spec = JSON.parse(swaggerInput);
      }
      
      // Convert to target format
      if (targetFormat === 'yaml') {
        setSwaggerInput(jsYaml.dump(spec, { 
          indent: 2, 
          lineWidth: 120,
          noCompatMode: true 
        }));
      } else {
        setSwaggerInput(JSON.stringify(spec, null, 2));
      }
      
      setInputFormat(targetFormat);
    } catch (err) {
      setError(`Failed to convert format: ${err.message}`);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadSpec = () => {
    const element = document.createElement('a');
    const fileExtension = inputFormat === 'yaml' ? 'yaml' : 'json';
    const mimeType = inputFormat === 'yaml' ? 'text/yaml' : 'application/json';
    const file = new Blob([swaggerInput], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = `openapi-spec.${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleEditorChange = (value) => {
    setSwaggerInput(value || '');
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Configure editor
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      wordWrap: 'on',
      automaticLayout: true
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getMethodColor = (method) => {
    const colors = {
      get: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      post: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      put: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      patch: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[method.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const renderSchema = (schema, name = '') => {
    if (!schema) return null;
    
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      return (
        <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">
          {refName}
        </span>
      );
    }
    
    if (schema.type === 'array') {
      return (
        <div className="text-sm">
          <span className="text-gray-600 dark:text-gray-400">Array of: </span>
          {renderSchema(schema.items)}
        </div>
      );
    }
    
    if (schema.type === 'object' && schema.properties) {
      return (
        <div className="text-sm space-y-1">
          {Object.entries(schema.properties).map(([prop, propSchema]) => (
            <div key={prop} className="flex items-center space-x-2">
              <span className="font-mono text-purple-600 dark:text-purple-400">{prop}</span>
              <span className="text-gray-500">:</span>
              <span className="text-blue-600 dark:text-blue-400">{propSchema.type}</span>
              {propSchema.format && (
                <span className="text-gray-500 text-xs">({propSchema.format})</span>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <span className="text-blue-600 dark:text-blue-400 font-mono text-sm">
        {schema.type}
        {schema.format && <span className="text-gray-500"> ({schema.format})</span>}
      </span>
    );
  };

  const renderToolbar = () => (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          Swagger / OpenAPI Editor
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Build, validate, and preview your API specs
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Format Toggle */}
        <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-1">
          <button
            onClick={() => convertFormat('json')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              inputFormat === 'json'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            JSON
          </button>
          <button
            onClick={() => convertFormat('yaml')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              inputFormat === 'yaml'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            YAML
          </button>
        </div>

        {/* Layout Toggle */}
        <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-1">
          <button
            onClick={() => setLayout('editor')}
            className={`p-2 rounded-md transition-colors ${
              layout === 'editor'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            title="Editor Only"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setLayout('split')}
            className={`p-2 rounded-md transition-colors ${
              layout === 'split'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            title="Split View"
          >
            <SplitSquareVertical className="h-4 w-4" />
          </button>
          <button
            onClick={() => setLayout('preview')}
            className={`p-2 rounded-md transition-colors ${
              layout === 'preview'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            title="Preview Only"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={loadSampleSpec}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Load Sample
          </button>
          
          {swaggerInput && (
            <>
              <button
                onClick={() => copyToClipboard(swaggerInput)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                title={copied ? 'Copied!' : 'Copy to Clipboard'}
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={downloadSpec}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                title="Download Spec"
              >
                <Download className="h-4 w-4" />
              </button>
            </>
          )}
          
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          language={inputFormat}
          value={swaggerInput}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme={isDarkMode ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            glyphMargin: true,
            folding: true,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: false,
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true }
          }}
        />
      </div>
      
      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm">
        <div className="flex items-center gap-3">
          <span className="text-gray-600 dark:text-gray-400">
            Format: <span className="font-medium text-gray-900 dark:text-white">{inputFormat.toUpperCase()}</span>
          </span>
          {isValidating && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Validating...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {error && (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span>Error</span>
            </div>
          )}
          {parsedSpec && !error && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="h-3 w-3" />
              <span>Valid</span>
            </div>
          )}
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-3 w-3" />
              <span>{validationErrors.length} warning{validationErrors.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="h-full overflow-auto p-4 bg-white dark:bg-gray-900">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Specification Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Warnings */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Validation Warnings
              </h3>
              <div className="mt-2 space-y-1">
                {validationErrors.map((warning, index) => (
                  <p key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                    {warning.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {parsedSpec && !error && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                Valid OpenAPI Specification
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Your API specification is valid and ready to use!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* API Preview */}
      {parsedSpec && (
        <div className="space-y-6">
          {/* API Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              {parsedSpec.info.title}
            </h2>
            {parsedSpec.info.description && (
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                {parsedSpec.info.description}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-white dark:bg-blue-800/30 p-3 rounded-md">
                <span className="font-medium text-blue-800 dark:text-blue-200">Version:</span>
                <span className="ml-2 text-blue-700 dark:text-blue-300">{parsedSpec.info.version}</span>
              </div>
              <div className="bg-white dark:bg-blue-800/30 p-3 rounded-md">
                <span className="font-medium text-blue-800 dark:text-blue-200">OpenAPI:</span>
                <span className="ml-2 text-blue-700 dark:text-blue-300">
                  {parsedSpec.openapi || parsedSpec.swagger}
                </span>
              </div>
              {parsedSpec.info.contact && (
                <div className="bg-white dark:bg-blue-800/30 p-3 rounded-md">
                  <span className="font-medium text-blue-800 dark:text-blue-200">Contact:</span>
                  <span className="ml-2 text-blue-700 dark:text-blue-300">
                    {parsedSpec.info.contact.email || parsedSpec.info.contact.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Servers */}
          {parsedSpec.servers && parsedSpec.servers.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Servers</h3>
              <div className="space-y-3">
                {parsedSpec.servers.map((server, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <div className="font-mono text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {server.url}
                      </div>
                      {server.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {server.description}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Endpoints */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Endpoints</h3>
            {Object.entries(parsedSpec.paths).map(([path, pathItem]) => (
              <div key={path} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-mono text-lg font-medium text-gray-900 dark:text-white">
                    {path}
                  </h4>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(pathItem).map(([method, operation]) => {
                    if (!operation.summary && !operation.description) return null;
                    
                    const endpointKey = `${method}-${path}`;
                    const isActive = activeEndpoint === endpointKey;
                    
                    return (
                      <div key={method} className="p-6 bg-white dark:bg-gray-900">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setActiveEndpoint(isActive ? null : endpointKey)}
                        >
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${getMethodColor(method)}`}>
                              {method}
                            </span>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white text-lg">
                                {operation.summary}
                              </div>
                              {operation.description && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {operation.description}
                                </div>
                              )}
                              {operation.tags && operation.tags.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  {operation.tags.map((tag, tagIndex) => (
                                    <span 
                                      key={tagIndex}
                                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Eye className={`h-5 w-5 text-gray-400 transform transition-transform ${isActive ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {isActive && (
                          <div className="mt-6 space-y-6 pl-8 border-l-2 border-gray-200 dark:border-gray-700">
                            {/* Parameters */}
                            {operation.parameters && operation.parameters.length > 0 && (
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Parameters</h5>
                                <div className="space-y-3">
                                  {operation.parameters.map((param, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                      <div className="flex items-center space-x-3 mb-2">
                                        <span className="font-mono text-purple-600 dark:text-purple-400 font-medium">
                                          {param.name}
                                        </span>
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                          {param.in}
                                        </span>
                                        {param.required && (
                                          <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                                            required
                                          </span>
                                        )}
                                      </div>
                                      {param.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                          {param.description}
                                        </p>
                                      )}
                                      {param.schema && (
                                        <div className="text-sm">
                                          <span className="text-gray-500 dark:text-gray-400">Type: </span>
                                          {renderSchema(param.schema)}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Request Body */}
                            {operation.requestBody && (
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Request Body</h5>
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                  {operation.requestBody.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                      {operation.requestBody.description}
                                    </p>
                                  )}
                                  {operation.requestBody.content && (
                                    <div className="space-y-3">
                                      {Object.entries(operation.requestBody.content).map(([contentType, content]) => (
                                        <div key={contentType}>
                                          <div className="text-sm font-mono text-gray-700 dark:text-gray-300 font-medium mb-2">
                                            {contentType}
                                          </div>
                                          {content.schema && (
                                            <div className="ml-4">
                                              {renderSchema(content.schema)}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Responses */}
                            {operation.responses && (
                              <div>
                                <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Responses</h5>
                                <div className="space-y-3">
                                  {Object.entries(operation.responses).map(([statusCode, response]) => (
                                    <div key={statusCode} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                      <div className="flex items-center space-x-3 mb-2">
                                        <span className={`px-3 py-1 text-xs font-bold rounded ${
                                          statusCode.startsWith('2') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                          statusCode.startsWith('4') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                          statusCode.startsWith('5') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                        }`}>
                                          {statusCode}
                                        </span>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          {response.description}
                                        </span>
                                      </div>
                                      {response.content && Object.entries(response.content).map(([contentType, content]) => (
                                        <div key={contentType} className="mt-3">
                                          <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-1">
                                            {contentType}
                                          </div>
                                          {content.schema && (
                                            <div className="ml-4">
                                              {renderSchema(content.schema)}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Schemas */}
          {parsedSpec.components && parsedSpec.components.schemas && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Models</h3>
              <div className="space-y-4">
                {Object.entries(parsedSpec.components.schemas).map(([schemaName, schema]) => (
                  <div key={schemaName} className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="font-mono text-lg font-medium text-purple-600 dark:text-purple-400 mb-2">
                      {schemaName}
                    </h4>
                    {schema.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {schema.description}
                      </p>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {renderSchema(schema)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!swaggerInput.trim() && (
        <div className="text-center py-12">
          <FileCode className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No API Specification
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start by loading a sample specification or pasting your own OpenAPI/Swagger spec.
          </p>
          <button
            onClick={loadSampleSpec}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Load Sample API
          </button>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (layout === 'editor') {
      return renderEditor();
    } else if (layout === 'preview') {
      return renderPreview();
    } else {
      // Split layout
      return (
        <Split
          sizes={[50, 50]}
          minSize={300}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className="split"
        >
          {renderEditor()}
          {renderPreview()}
        </Split>
      );
    }
  };

  return (
    <div className={`w-full h-screen flex flex-col ${isDarkMode ? 'dark' : ''}`}>
      {renderToolbar()}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default SwaggerPreview;
