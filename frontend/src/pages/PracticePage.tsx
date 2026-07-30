import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const PracticePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new PISA experience
    navigate('/pisa', { replace: true });
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <p>Redirecting to PISA experience...</p>
    </div>
  );
};
