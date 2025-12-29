import React, { useState } from 'react';

const App = () => {

  console.log('API Address:', import.meta.env.VITE_API_URL);

  const [count, setCount] = useState(0);
  return (
    <div className="container">
      <h1>Hello Webpack!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Add</button>
    </div>
  );
};

export default App;