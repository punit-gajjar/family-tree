import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import './DatePicker.css';

interface DatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
}

export default function DatePicker({
    selected,
    onChange,
    placeholder = "Select date",
    className = "",
    minDate,
    maxDate
}: DatePickerProps) {
    return (
        <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
            <ReactDatePicker
                selected={selected}
                onChange={onChange}
                dateFormat="dd/MM/yyyy"
                placeholderText={placeholder}
                minDate={minDate}
                maxDate={maxDate}
                className={`w-full pl-10 pr-3 py-2 glass-input rounded-lg text-sm ${className}`}
                calendarClassName="glass-calendar"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                autoComplete="off"
            />
        </div>
    );
}
