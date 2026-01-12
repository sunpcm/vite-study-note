import React, { useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);

  console.log('API Address:', import.meta.env.VITE_API_URL);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Hello Webpack!
        </h1>
        <div className="bg-gray-50 rounded-md p-4 mb-6 text-center">
          <p className="text-gray-600 mb-2">Current Count:</p>
          <p className="text-4xl font-bold text-blue-600">{count}</p>
        </div>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Increment Count
        </button>
      </div>
    </div>
  );
};

export default App;