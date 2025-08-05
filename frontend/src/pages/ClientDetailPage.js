import React from 'react';

const ClientDetailPage = () => {
  console.log('SIMPLE TEST - Component is working!');
  
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: 'yellow', 
      fontSize: '24px',
      textAlign: 'center'
    }}>
      <h1>🎉 CLIENT DETAIL PAGE IS WORKING! 🎉</h1>
      <p>If you can see this, the component is rendering!</p>
      <p>This is a simple test to verify the component loads.</p>
    </div>
  );
};

export default ClientDetailPage; 