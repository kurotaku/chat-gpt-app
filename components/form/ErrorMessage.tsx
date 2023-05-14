import React from 'react';

const ErrorMessage = ({ children }) => {
  return (
    <div className='border-rose-200 border bg-rose-100 text-rose-600 p-2 rounded-lg'>
      {children}
    </div>
  );
};

export default ErrorMessage;
