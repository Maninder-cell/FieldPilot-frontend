'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface LazySelectProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  fetchItems: (params: { search?: string; page: number; page_size: number }) => Promise<{
    data: Array<{ id: string; name: string; code?: string }>;
    count: number;
  }>;
  fetchItemById?: (id: string) => Promise<{ data: { id: string; name: string; code?: string } }>;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  pageSize?: number;
  className?: string;
  multiple?: boolean;
}

export default function LazySelect({
  value,
  onChange,
  fetchItems,
  fetchItemById,
  placeholder = 'Select...',
  label,
  required = false,
  disabled = false,
  pageSize = 5,
  className = '',
  multiple = false,
}: LazySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Array<{ id: string; name: string; code?: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string; code?: string } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string; name: string; code?: string }>>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get selected IDs as array
  const selectedIds = multiple 
    ? (Array.isArray(value) ? value : []) 
    : (value ? [value as string] : []);

  // Load items
  const loadItems = useCallback(async (page: number, search: string = '', append: boolean = false) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await fetchItems({ search, page, page_size: pageSize });
      
      // Ensure response.data is an array
      const dataArray = Array.isArray(response.data) ? response.data : [];
      
      if (append) {
        setItems(prev => [...prev, ...dataArray]);
      } else {
        setItems(dataArray);
      }
      
      setTotalCount(response.count);
      setHasMore(items.length + dataArray.length < response.count);
    } catch (error) {
      console.error('Failed to load items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems, pageSize, isLoading]);

  // Initial load
  useEffect(() => {
    if (isOpen) {
      loadItems(1, searchQuery);
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Search with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      loadItems(1, searchQuery);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load selected item details
  useEffect(() => {
    const loadSelectedItems = async () => {
      if (multiple) {
        // Multi-select mode
        const ids = Array.isArray(value) ? value.filter(id => id && id.trim()) : [];
        
        if (ids.length === 0) {
          setSelectedItems([]);
          return;
        }

        // Load details for all selected IDs
        const itemsToLoad: Array<{ id: string; name: string; code?: string }> = [];
        
        for (const id of ids) {
          if (!id || !id.trim()) continue; // Skip empty/invalid IDs
          
          // Check if already in items list
          const found = items.find(item => item.id === id);
          if (found) {
            itemsToLoad.push(found);
          } else if (fetchItemById) {
            // Fetch from API
            try {
              const response = await fetchItemById(id);
              itemsToLoad.push(response.data);
            } catch (error) {
              console.error('Failed to load item:', id, error);
            }
          }
        }
        
        setSelectedItems(itemsToLoad);
      } else {
        // Single-select mode
        if (!value || Array.isArray(value)) {
          setSelectedItem(null);
          return;
        }
        
        // Check if we need to update the selected item
        if (selectedItem && selectedItem.id === value) {
          return; // Already have the correct item
        }
        
        // First, try to find in current items
        const found = items.find(item => item.id === value);
        if (found) {
          setSelectedItem(found);
          return;
        }
        
        // If not found and we have a fetchItemById function, fetch it
        if (fetchItemById) {
          try {
            const response = await fetchItemById(value as string);
            setSelectedItem(response.data);
          } catch (error) {
            console.error('Failed to load selected item:', error);
          }
        }
      }
    };
    
    loadSelectedItems();
  }, [value, items, fetchItemById, multiple]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    
    // Load more when scrolled to 80% of the list
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadItems(nextPage, searchQuery, true);
    }
  }, [currentPage, searchQuery, isLoading, hasMore, loadItems]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (item: { id: string; name: string; code?: string }) => {
    if (multiple) {
      // Multi-select mode
      const ids = Array.isArray(value) ? value : [];
      if (ids.includes(item.id)) {
        // Remove if already selected
        const newIds = ids.filter(id => id !== item.id);
        const newItems = selectedItems.filter(i => i.id !== item.id);
        setSelectedItems(newItems);
        onChange(newIds);
      } else {
        // Add to selection
        const newIds = [...ids, item.id];
        const newItems = [...selectedItems, item];
        setSelectedItems(newItems);
        onChange(newIds);
      }
      // Keep dropdown open in multi-select mode
      setSearchQuery('');
    } else {
      // Single-select mode
      setSelectedItem(item);
      onChange(item.id);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      setSelectedItems([]);
      onChange([]);
    } else {
      setSelectedItem(null);
      onChange('');
    }
  };

  const handleRemoveItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (multiple) {
      const ids = Array.isArray(value) ? value : [];
      const newIds = ids.filter(id => id !== itemId);
      const newItems = selectedItems.filter(i => i.id !== itemId);
      setSelectedItems(newItems);
      onChange(newIds);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        {/* Select Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-left flex items-center justify-between min-h-[42px] ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
          }`}
        >
          {multiple ? (
            // Multi-select display
            <div className="flex-1 flex flex-wrap gap-1.5">
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="max-w-[150px] truncate">{item.name}</span>
                    {!disabled && (
                      <X
                        className="h-3 w-3 hover:text-emerald-900 cursor-pointer"
                        onClick={(e) => handleRemoveItem(e, item.id)}
                      />
                    )}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </div>
          ) : (
            // Single-select display
            <span className={selectedItem ? 'text-gray-900' : 'text-gray-500'}>
              {selectedItem ? (
                <>
                  {selectedItem.name}
                  {selectedItem.code && <span className="text-gray-500 ml-1">({selectedItem.code})</span>}
                </>
              ) : (
                placeholder
              )}
            </span>
          )}
          <div className="flex items-center gap-1 ml-2">
            {((multiple && selectedItems.length > 0) || (!multiple && selectedItem)) && !disabled && (
              <X
                className="h-4 w-4 text-gray-400 hover:text-gray-600"
                onClick={handleClear}
              />
            )}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 flex flex-col">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* Items List */}
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="overflow-y-auto flex-1"
              style={{ maxHeight: '250px' }}
            >
              {items.length === 0 && !isLoading ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {searchQuery ? 'No results found' : 'No items available'}
                </div>
              ) : (
                <>
                  {items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={`w-full px-4 py-2 text-left hover:bg-emerald-50 transition-colors flex items-center gap-2 ${
                          isSelected ? 'bg-emerald-100 text-emerald-900' : 'text-gray-900'
                        }`}
                      >
                        {multiple && (
                          <div className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.name}</div>
                          {item.code && (
                            <div className="text-xs text-gray-500">{item.code}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  
                  {isLoading && (
                    <div className="p-4 text-center">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                    </div>
                  )}
                  
                  {!isLoading && hasMore && items.length > 0 && (
                    <div className="p-2 text-center text-xs text-gray-500">
                      Scroll for more...
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Info */}
            {items.length > 0 && (
              <div className="p-2 border-t border-gray-200 text-xs text-gray-500 text-center">
                Showing {items.length} of {totalCount}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
