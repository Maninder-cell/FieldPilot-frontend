'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface LazySelectProps {
  value: string;
  onChange: (value: string) => void;
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
}: LazySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<Array<{ id: string; name: string; code?: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string; code?: string } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load items
  const loadItems = useCallback(async (page: number, search: string = '', append: boolean = false) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await fetchItems({ search, page, page_size: pageSize });
      
      if (append) {
        setItems(prev => [...prev, ...response.data]);
      } else {
        setItems(response.data);
      }
      
      setTotalCount(response.count);
      setHasMore(items.length + response.data.length < response.count);
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
    const loadSelectedItem = async () => {
      if (!value) {
        setSelectedItem(null);
        return;
      }
      
      // Check if we need to update the selected item
      if (selectedItem && selectedItem.id === value) {
        return; // Already have the correct item
      }
      
      console.log('LazySelect - Loading item for value:', value);
      
      // First, try to find in current items
      const found = items.find(item => item.id === value);
      if (found) {
        console.log('LazySelect - Found in items:', found);
        setSelectedItem(found);
        return;
      }
      
      // If not found and we have a fetchItemById function, fetch it
      if (fetchItemById) {
        try {
          console.log('LazySelect - Fetching item by ID:', value);
          const response = await fetchItemById(value);
          console.log('LazySelect - Fetched item:', response.data);
          setSelectedItem(response.data);
        } catch (error) {
          console.error('Failed to load selected item:', error);
        }
      } else {
        console.log('LazySelect - No fetchItemById function provided');
      }
    };
    
    loadSelectedItem();
  }, [value, items, fetchItemById, selectedItem]);

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
    setSelectedItem(item);
    onChange(item.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(null);
    onChange('');
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
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-left flex items-center justify-between ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
          }`}
        >
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
          <div className="flex items-center gap-1">
            {selectedItem && !disabled && (
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
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`w-full px-4 py-2 text-left hover:bg-emerald-50 transition-colors ${
                        item.id === value ? 'bg-emerald-100 text-emerald-900' : 'text-gray-900'
                      }`}
                    >
                      <div className="text-sm font-medium">{item.name}</div>
                      {item.code && (
                        <div className="text-xs text-gray-500">{item.code}</div>
                      )}
                    </button>
                  ))}
                  
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
