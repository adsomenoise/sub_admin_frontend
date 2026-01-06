import React from 'react';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 4rem)',
        fontWeight: 'bold',
        marginBottom: '1rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }}>
        Club Admin
      </h1>
      <h2 style={{
        fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
        fontWeight: 'bold',
        marginBottom: '1rem',
        opacity: 0.9
      }}>
        Coming Soon
      </h2>
      <p style={{
        fontSize: 'clamp(1rem, 2vw, 1.5rem)',
        opacity: 0.8,
        maxWidth: '600px',
        lineHeight: 1.6
      }}>
        The club admin portal is under development. Stay tuned!
      </p>
      <div style={{
        marginTop: '3rem',
        padding: '1rem 2rem',
        border: '2px solid rgba(255,255,255,0.3)',
        borderRadius: '50px',
        fontSize: '1rem'
      }}>
        fanflix.be/subadmin
      </div>
    </div>
  );
}

export default App;
