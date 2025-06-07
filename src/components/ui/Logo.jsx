import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center">
      <div className="flex items-center justify-center w-8 h-8 rounded-md">
        <img src="/logoo.png" alt="" />
      </div>
      <span className="ml-2 text-xl font-bold text-neutral-900">The Aacharya</span>
    </div>
  );
}