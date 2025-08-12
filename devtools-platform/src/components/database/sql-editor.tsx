'use client';

import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatSQLQuery, validateSQLSyntax, detectSQLDialect } from '@/lib/database-utils';
import { Copy, Play, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

interface SQLEditorProps {
  value: string;
  onChange: (value: string) => void;
  dialect?: string;
  placeholder?: string;
  onExecute?: (query: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function SQLEditor({ 
  value, 
  onChange, 
  dialect = 'generic',
  placeholder = 'Enter your SQL query here...',
  onExecute,
  readOnly = false,
  className = ''
}: SQLEditorProps) {
  const [validation, setValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });
  const [detectedDialect, setDetectedDialect] = useState<string>(dialect);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (value) {
      const validationResult = validateSQLSyntax(value);
      setValidation(validationResult);
      
      const detected = detectSQLDialect(value);
      if (detected !== 'generic') {
        setDetectedDialect(detected);
      }
    } else {
      setValidation({ valid: true });
    }
  }, [value]);

  const handleFormat = () => {
    if (value) {
      try {
        const formatted = formatSQLQuery(value, detectedDialect);
        onChange(formatted);
      } catch (error) {
        console.warn('Failed to format SQL:', error);
      }
    }
  };

  const handleExecute = () => {
    if (onExecute && value && validation.valid) {
      onExecute(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to execute
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
    
    // Tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        
        // Reset cursor position
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {detectedDialect !== 'generic' && (
            <span className="status-success">
              {detectedDialect.toUpperCase()}
            </span>
          )}
          {!validation.valid && (
            <div className="status-error">
              <AlertCircle className="h-3 w-3 mr-1 inline" />
              Invalid SQL
            </div>
          )}
          {validation.valid && value && (
            <div className="status-success">
              <CheckCircle className="h-3 w-3 mr-1 inline" />
              Valid SQL
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={handleFormat} 
            disabled={!value || readOnly} 
            className="btn-secondary"
          >
            <FileText className="h-4 w-4 mr-2" />
            Format
          </Button>
          
          <Button 
            onClick={() => copyToClipboard(value)} 
            disabled={!value} 
            className="btn-secondary"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          
          {onExecute && (
            <Button 
              onClick={handleExecute} 
              disabled={!value || !validation.valid}
              className="btn-primary"
            >
              <Play className="h-4 w-4 mr-2" />
              Execute
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={16}
          className={`font-mono text-sm resize-none min-h-[400px] ${
            validation.valid ? '' : 'border-red-300 focus:border-red-500'
          }`}
          readOnly={readOnly}
        />
        
        {!validation.valid && validation.error && (
          <div className="absolute bottom-3 left-3 right-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            {validation.error}
          </div>
        )}
      </div>

      {onExecute && (
        <div className="flex items-center justify-center py-2 px-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <span>Press</span>
          <kbd className="mx-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs">Ctrl</kbd>
          <span>+</span>
          <kbd className="mx-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs">Enter</kbd>
          <span>to execute query</span>
        </div>
      )}
    </div>
  );
}