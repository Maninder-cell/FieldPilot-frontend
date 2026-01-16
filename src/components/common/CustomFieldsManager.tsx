'use client';

import { useState } from 'react';
import { Plus, X, Edit2, Check, XCircle } from 'lucide-react';

interface CustomFieldsManagerProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  disabled?: boolean;
}

interface EditingField {
  originalKey: string;
  key: string;
  value: string;
}

export default function CustomFieldsManager({
  value,
  onChange,
  disabled = false,
}: CustomFieldsManagerProps) {
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const fields = Object.entries(value || {});

  const handleStartEdit = (key: string, val: any) => {
    setEditingField({
      originalKey: key,
      key: key,
      value: String(val),
    });
  };

  const handleSaveEdit = () => {
    if (!editingField || !editingField.key.trim()) return;

    const updatedFields = { ...value };

    // Remove old key if it changed
    if (editingField.originalKey !== editingField.key) {
      delete updatedFields[editingField.originalKey];
    }

    updatedFields[editingField.key.trim()] = editingField.value.trim();
    onChange(updatedFields);
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  const handleRemove = (key: string) => {
    const updatedFields = { ...value };
    delete updatedFields[key];
    onChange(updatedFields);
  };

  const handleAddNew = () => {
    if (!newKey.trim()) return;

    const updatedFields = {
      ...value,
      [newKey.trim()]: newValue.trim(),
    };

    onChange(updatedFields);
    setNewKey('');
    setNewValue('');
    setIsAddingNew(false);
  };

  const handleCancelAdd = () => {
    setNewKey('');
    setNewValue('');
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-4">
      {/* Existing Fields */}
      {fields.length > 0 && (
        <div className="space-y-3">
          {fields.map(([key, val]) => {
            const isEditing = editingField?.originalKey === key;

            if (isEditing) {
              // Edit Mode
              return (
                <div key={key} className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={editingField.key}
                      onChange={(e) => setEditingField({ ...editingField, key: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter field name"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Field Value
                    </label>
                    <input
                      type="text"
                      value={editingField.value}
                      onChange={(e) => setEditingField({ ...editingField, value: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveEdit();
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter field value"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={!editingField.key.trim()}
                      className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>
              );
            }

            // Display Mode
            return (
              <div
                key={key}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {key}
                    </label>
                    <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                      {String(val) || <span className="text-gray-400 italic">No value</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 pt-6">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(key, val)}
                      disabled={disabled}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit field"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(key)}
                      disabled={disabled}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove field"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Field Section */}
      {isAddingNew ? (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Field Name
            </label>
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g., Serial Number, Warranty Period"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Field Value
            </label>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNew();
                } else if (e.key === 'Escape') {
                  handleCancelAdd();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter the value"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancelAdd}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddNew}
              disabled={!newKey.trim()}
              className="px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingNew(true)}
          disabled={disabled}
          className="w-full px-4 py-3 border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          Add Custom Field
        </button>
      )}

      {fields.length === 0 && !isAddingNew && (
        <p className="text-sm text-gray-500 text-center py-4">
          No custom fields added yet. Click the button above to add your first field.
        </p>
      )}
    </div>
  );
}
