import React, { useState, useEffect } from 'react';

const RegexTester = () => {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState('g');
  const [replacement, setReplacement] = useState('');
  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [replacedText, setReplacedText] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Common regex patterns for quick testing
  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
    { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'gi' },
    { name: 'Phone (US)', pattern: '\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})', flags: 'g' },
    { name: 'IPv4', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', flags: 'g' },
    { name: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', flags: 'gi' },
    { name: 'Credit Card', pattern: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\\b', flags: 'g' }
  ];

  useEffect(() => {
    testRegex();
  }, [pattern, testString, flags, replacement]);

  const testRegex = () => {
    if (!pattern) {
      setMatches([]);
      setGroups([]);
      setReplacedText('');
      setError('');
      setIsValid(true);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      setIsValid(true);
      setError('');

      // Find all matches
      const allMatches = [];
      const allGroups = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          allMatches.push({
            match: match[0],
            index: match.index,
            length: match[0].length
          });
          
          if (match.length > 1) {
            allGroups.push({
              full: match[0],
              groups: match.slice(1),
              index: match.index
            });
          }
        }
      } else {
        match = testString.match(regex);
        if (match) {
          allMatches.push({
            match: match[0],
            index: match.index,
            length: match[0].length
          });
          
          if (match.length > 1) {
            allGroups.push({
              full: match[0],
              groups: match.slice(1),
              index: match.index
            });
          }
        }
      }

      setMatches(allMatches);
      setGroups(allGroups);

      // Test replacement
      if (replacement) {
        try {
          const replaced = testString.replace(regex, replacement);
          setReplacedText(replaced);
        } catch (replaceError) {
          setReplacedText('Error in replacement: ' + replaceError.message);
        }
      } else {
        setReplacedText('');
      }

    } catch (regexError) {
      setIsValid(false);
      setError(regexError.message);
      setMatches([]);
      setGroups([]);
      setReplacedText('');
    }
  };

  const highlightMatches = (text) => {
    if (!matches.length || !text) return text;

    let highlighted = '';
    let lastIndex = 0;

    matches.forEach((match, index) => {
      // Add text before match
      highlighted += text.slice(lastIndex, match.index);
      
      // Add highlighted match
      highlighted += `<mark class="bg-yellow-200 dark:bg-yellow-600 font-semibold" title="Match ${index + 1}">${text.slice(match.index, match.index + match.length)}</mark>`;
      
      lastIndex = match.index + match.length;
    });

    // Add remaining text
    highlighted += text.slice(lastIndex);

    return highlighted;
  };

  const loadCommonPattern = (commonPattern) => {
    setPattern(commonPattern.pattern);
    setFlags(commonPattern.flags);
  };

  const toggleFlag = (flag) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div className="w-full max-w-none p-4 space-y-4 overflow-hidden">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Regular Expression Tester
        </h1>

        {/* Common Patterns */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Patterns
          </label>
          <div className="flex flex-wrap gap-2">
            {commonPatterns.map((commonPattern, index) => (
              <button
                key={index}
                onClick={() => loadCommonPattern(commonPattern)}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {commonPattern.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pattern Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Regular Expression Pattern
          </label>
          <div className="relative">
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter your regex pattern..."
              className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white ${
                isValid 
                  ? 'border-gray-300 dark:border-gray-600 focus:border-blue-500' 
                  : 'border-red-500 dark:border-red-400'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            />
            {!isValid && (
              <div className="absolute right-3 top-2">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
            )}
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Error: {error}
            </p>
          )}
        </div>

        {/* Flags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Flags
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { flag: 'g', label: 'Global', desc: 'Find all matches' },
              { flag: 'i', label: 'Ignore Case', desc: 'Case insensitive' },
              { flag: 'm', label: 'Multiline', desc: '^$ match line breaks' },
              { flag: 's', label: 'Dot All', desc: '. matches newlines' },
              { flag: 'u', label: 'Unicode', desc: 'Unicode support' },
              { flag: 'y', label: 'Sticky', desc: 'Match from lastIndex' }
            ].map(({ flag, label, desc }) => (
              <label key={flag} className="flex items-center cursor-pointer text-xs" title={desc}>
                <input
                  type="checkbox"
                  checked={flags.includes(flag)}
                  onChange={() => toggleFlag(flag)}
                  className="mr-1"
                />
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  {label} ({flag})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Test String */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Test String
          </label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter text to test against your regex..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          />
        </div>

        {/* Replacement */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Replacement (optional)
          </label>
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="Replacement string (use $1, $2 for groups)..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          />
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matches */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Matches ({matches.length})
            </h3>
            {matches.length > 0 ? (
              <div className="space-y-2">
                {matches.map((match, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="font-mono text-sm">
                      <span className="text-green-600 dark:text-green-400">Match {index + 1}:</span>
                      <span className="ml-2 font-semibold">{match.match}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Position: {match.index}-{match.index + match.length}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No matches found</p>
            )}
          </div>

          {/* Groups */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Capture Groups
            </h3>
            {groups.length > 0 ? (
              <div className="space-y-2">
                {groups.map((group, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="font-mono text-sm mb-2">
                      <span className="text-blue-600 dark:text-blue-400">Full match:</span>
                      <span className="ml-2 font-semibold">{group.full}</span>
                    </div>
                    {group.groups.map((grp, grpIndex) => (
                      <div key={grpIndex} className="font-mono text-sm">
                        <span className="text-purple-600 dark:text-purple-400">Group {grpIndex + 1}:</span>
                        <span className="ml-2">{grp}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No capture groups</p>
            )}
          </div>
        </div>

        {/* Highlighted Text */}
        {testString && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Highlighted Matches
            </h3>
            <div 
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md font-mono text-sm whitespace-pre-wrap border"
              dangerouslySetInnerHTML={{ __html: highlightMatches(testString) }}
            />
          </div>
        )}

        {/* Replaced Text */}
        {replacedText && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Replacement Result
            </h3>
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-md font-mono text-sm whitespace-pre-wrap border">
              {replacedText}
            </div>
          </div>
        )}

        {/* Help */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Quick Reference</h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 grid grid-cols-2 gap-2">
            <div><code>.</code> - Any character</div>
            <div><code>*</code> - 0 or more</div>
            <div><code>+</code> - 1 or more</div>
            <div><code>?</code> - 0 or 1</div>
            <div><code>\d</code> - Digit</div>
            <div><code>\w</code> - Word character</div>
            <div><code>\s</code> - Whitespace</div>
            <div><code>[abc]</code> - Character set</div>
            <div><code>(abc)</code> - Capture group</div>
            <div><code>^</code> - Start of line</div>
            <div><code>$</code> - End of line</div>
            <div><code>{'{2,4}'}</code> - 2 to 4 occurrences</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;