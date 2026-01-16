'use client';

import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

interface DateTimePickerProps {
    label?: string;
    value: string | undefined;
    onChange: (value: string | undefined) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    showTimeSelect?: boolean;
    minDate?: Date;
    maxDate?: Date;
}

// Custom input component
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, placeholder, disabled }, ref) => (
    <div className="relative">
        <input
            ref={ref}
            type="text"
            value={value || ''}
            onClick={onClick}
            placeholder={placeholder}
            disabled={disabled}
            readOnly
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
        </div>
    </div>
));

CustomInput.displayName = 'CustomInput';

export default function DateTimePicker({
    label,
    value,
    onChange,
    placeholder = 'Select date and time',
    required = false,
    disabled = false,
    showTimeSelect = true,
    minDate,
    maxDate,
}: DateTimePickerProps) {
    // Convert string to Date object
    const dateValue = value ? new Date(value) : null;

    // Handle date change
    const handleChange = (date: Date | null) => {
        if (date) {
            // Convert to ISO string format for datetime-local input compatibility
            const isoString = date.toISOString().slice(0, 16);
            onChange(isoString);
        } else {
            onChange(undefined);
        }
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <DatePicker
                selected={dateValue}
                onChange={handleChange}
                showTimeSelect={showTimeSelect}
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat={showTimeSelect ? "MMM d, yyyy h:mm aa" : "MMM d, yyyy"}
                placeholderText={placeholder}
                disabled={disabled}
                minDate={minDate}
                maxDate={maxDate}
                customInput={<CustomInput />}
                calendarClassName="custom-datepicker"
                popperClassName="custom-datepicker-popper"
                showPopperArrow={false}
                isClearable={!required}
            />
        </div>
    );
}
