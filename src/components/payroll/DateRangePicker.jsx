import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function DateRangePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="py-2 px-4 bg-white border border-neutral-300 rounded-md shadow-sm flex items-center justify-between w-full"
      >
        <span className="text-neutral-800">{value}</span>
        <ChevronDownIcon className="ml-2 h-5 w-5 text-neutral-400" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-neutral-200 p-4">
          <div className="space-y-4">
            <button 
              onClick={() => {
                onChange('01 July - 31 July 2024');
                setIsOpen(false);
              }}
              className="w-full text-left py-2 px-4 hover:bg-neutral-100 rounded-md"
            >
              01 July - 31 July 2024
            </button>
            <button 
              onClick={() => {
                onChange('01 June - 30 June 2024');
                setIsOpen(false);
              }}
              className="w-full text-left py-2 px-4 hover:bg-neutral-100 rounded-md"
            >
              01 June - 30 June 2024
            </button>
            <button 
              onClick={() => {
                onChange('01 May - 31 May 2024');
                setIsOpen(false);
              }}
              className="w-full text-left py-2 px-4 hover:bg-neutral-100 rounded-md"
            >
              01 May - 31 May 2024
            </button>
            <button 
              onClick={() => {
                onChange('Custom Range...');
                setIsOpen(false);
              }}
              className="w-full text-left py-2 px-4 text-primary-600 font-medium hover:bg-primary-50 rounded-md"
            >
              Custom Range...
            </button>
          </div>
        </div>
      )}
    </div>
  );
}