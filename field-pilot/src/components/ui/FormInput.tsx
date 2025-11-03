'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  autoFocus = false,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`
            w-full px-4 py-3 rounded-lg border transition-colors
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      
      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
