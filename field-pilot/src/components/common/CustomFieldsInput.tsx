'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface CustomFieldsInputProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  disabled?: boolean;
}

export default function CustomFieldsInput({
  value,
  onChange,
  disabled = false,
}: CustomFieldsInputProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const fields = Object.entries(value || {});

  const handleAdd = () => {
    if (!newKey.trim()) return;

    const updatedFields = {
      ...value,
      [newKey.trim()]: newValue.trim(),
    };

    onChange(updatedFields);
    setNewKey('');
    setNewValue('');
  };

  const handleRemove = (key: string) => {
    const updatedFields = { ...value };
    delete updatedFields[key];
    onChange(updatedFields);
  };

  const handleUpdate = (oldKey: string, newKey: string, newValue: string) => {
    const updatedFields = { ...value };
    
    // If key changed, remove old key
    if (oldKey !== newKey) {
      delete updatedFields[oldKey];
    }
    
    updatedFields[newKey] = newValue;
    onChange(updatedFields);
  };

  return (
    <div className="space-y-3">
      {/* Existing Fields */}
      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map(([key, val]) => (
            <div key={key} className="flex gap-2">
              <input
                type="text"
                value={key}
                onChange={(e) => handleUpdate(key, e.target.value, val)}
                disabled={disabled}
                placeholder="Field name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                value={val}
                onChange={(e) => handleUpdate(key, key, e.target.value)}
                disabled={disabled}
                placeholder="Field value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => handleRemove(key)}
                disabled={disabled}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove field"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          disabled={disabled}
          placeholder="Field name"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          disabled={disabled}
          placeholder="Field value"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !newKey.trim()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="Add field"
        >
          <Plus className="h-5 w-5" />
          Add
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No custom fields added yet. Add key-value pairs above.
        </p>
      )}
    </div>
  );
}
