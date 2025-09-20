import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, ArrowLeftRight, Eye, EyeOff, FileText, Download } from 'lucide-react';

const TextDiffTool = () => {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [diffResult, setDiffResult] = useState(null);
  const [copied, setCopied] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [autoCompare, setAutoCompare] = useState(true);
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  // Simple diff algorithm - this is a basic implementation
  const computeDiff = (text1, text2, options = {}) => {
    const { ignoreCase = false, showWhitespace = false } = options;
    
    let processedText1 = text1;
    let processedText2 = text2;
    
    if (ignoreCase) {
      processedText1 = text1.toLowerCase();
      processedText2 = text2.toLowerCase();
    }
    
    const lines1 = processedText1.split('\n');
    const lines2 = processedText2.split('\n');
    
    const maxLines = Math.max(lines1.length, lines2.length);
    const diff = [];
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      const originalLine1 = text1.split('\n')[i] || '';
      const originalLine2 = text2.split('\n')[i] || '';
      
      let status = 'equal';
      if (line1 !== line2) {
        if (!line1) status = 'added';
        else if (!line2) status = 'removed';
        else status = 'modified';
      }
      
      diff.push({
        lineNumber: i + 1,
        left: originalLine1,
        right: originalLine2,
        status,
        leftExists: i < text1.split('\n').length,
        rightExists: i < text2.split('\n').length
      });
    }
    
    return diff;
  };

  const performDiff = () => {
    setIsComparing(true);
    
    setTimeout(() => {
      const result = computeDiff(leftText, rightText, { ignoreCase, showWhitespace });
      setDiffResult(result);
      setIsComparing(false);
    }, 100);
  };

  // Auto-compare when text changes
  useEffect(() => {
    if (autoCompare && (leftText || rightText)) {
      const timeoutId = setTimeout(() => {
        performDiff();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [leftText, rightText, ignoreCase, showWhitespace, autoCompare]);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const swapTexts = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  const clearAll = () => {
    setLeftText('');
    setRightText('');
    setDiffResult(null);
  };

  const loadSample = () => {
    setLeftText(`Hello World
This is a sample text
for demonstrating the diff tool.
Line 4 is here
And this is line 5`);
    
    setRightText(`Hello World!
This is a sample text
for demonstrating the diff tool.
Line 4 was modified
And this is line 5
New line added`);
  };

  const downloadDiff = () => {
    if (!diffResult) return;
    
    let diffText = 'Text Comparison Report\n';
    diffText += '='.repeat(50) + '\n\n';
    
    diffResult.forEach(line => {
      const prefix = line.status === 'added' ? '+ ' : 
                    line.status === 'removed' ? '- ' : 
                    line.status === 'modified' ? '~ ' : '  ';
      diffText += `${line.lineNumber.toString().padStart(3)}: ${prefix}${line.left || line.right}\n`;
    });
    
    const blob = new Blob([diffText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-diff-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusCount = () => {
    if (!diffResult) return { added: 0, removed: 0, modified: 0, equal: 0 };
    
    return diffResult.reduce((acc, line) => {
      acc[line.status]++;
      return acc;
    }, { added: 0, removed: 0, modified: 0, equal: 0 });
  };

  const statusCount = getStatusCount();

  const renderLine = (content, status, isLeft = true) => {
    if (showWhitespace) {
      content = content.replace(/ /g, '·').replace(/\t/g, '→');
    }
    
    const baseClasses = "font-mono text-sm px-3 py-1 border-r border-gray-200 dark:border-gray-600";
    
    switch (status) {
      case 'added':
        return `${baseClasses} bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200`;
      case 'removed':
        return `${baseClasses} bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200`;
      case 'modified':
        return `${baseClasses} bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200`;
      default:
        return `${baseClasses} bg-white dark:bg-gray-800 text-gray-900 dark:text-white`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Text Diff & Compare Tool
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare two texts side-by-side with highlighted differences
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoCompare}
                onChange={(e) => setAutoCompare(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Auto-compare</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Ignore case</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showWhitespace}
                onChange={(e) => setShowWhitespace(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Show whitespace</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={loadSample}
              className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <FileText className="h-3 w-3" />
              <span>Load Sample</span>
            </button>
            
            <button
              onClick={swapTexts}
              className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <ArrowLeftRight className="h-3 w-3" />
              <span>Swap</span>
            </button>
            
            {!autoCompare && (
              <button
                onClick={performDiff}
                disabled={isComparing}
                className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isComparing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                <span>Compare</span>
              </button>
            )}
            
            {diffResult && (
              <button
                onClick={downloadDiff}
                className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </button>
            )}
            
            <button
              onClick={clearAll}
              className="inline-flex items-center space-x-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Original Text (Left)
            </label>
            <button
              onClick={() => copyToClipboard(leftText, 'left')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="Enter or paste the original text here..."
            className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Modified Text (Right)
            </label>
            <button
              onClick={() => copyToClipboard(rightText, 'right')}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="Enter or paste the modified text here..."
            className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
          />
        </div>
      </div>

      {/* Diff Results */}
      {diffResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Comparison Results
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              {statusCount.added > 0 && (
                <span className="text-green-600 dark:text-green-400">
                  +{statusCount.added} added
                </span>
              )}
              {statusCount.removed > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  -{statusCount.removed} removed
                </span>
              )}
              {statusCount.modified > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400">
                  ~{statusCount.modified} modified
                </span>
              )}
              <span className="text-gray-600 dark:text-gray-400">
                ={statusCount.equal} unchanged
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded"></div>
                <span>Added lines</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-200 dark:bg-red-800 rounded"></div>
                <span>Removed lines</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-200 dark:bg-yellow-800 rounded"></div>
                <span>Modified lines</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <span>Unchanged lines</span>
              </div>
            </div>
          </div>

          {/* Diff Display */}
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 gap-0 max-h-96 overflow-y-auto">
              {/* Left Column */}
              <div className="border-r border-gray-200 dark:border-gray-600">
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  Original Text
                </div>
                {diffResult.map((line, index) => (
                  <div
                    key={index}
                    className={renderLine(
                      line.leftExists ? line.left : '',
                      line.status === 'added' ? 'equal' : line.status,
                      true
                    )}
                  >
                    <span className="text-gray-400 select-none mr-2 inline-block w-8 text-right">
                      {line.leftExists ? line.lineNumber : ''}
                    </span>
                    {line.leftExists ? line.left || ' ' : ''}
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div>
                <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                  Modified Text
                </div>
                {diffResult.map((line, index) => (
                  <div
                    key={index}
                    className={renderLine(
                      line.rightExists ? line.right : '',
                      line.status === 'removed' ? 'equal' : line.status,
                      false
                    )}
                  >
                    <span className="text-gray-400 select-none mr-2 inline-block w-8 text-right">
                      {line.rightExists ? line.lineNumber : ''}
                    </span>
                    {line.rightExists ? line.right || ' ' : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextDiffTool;
