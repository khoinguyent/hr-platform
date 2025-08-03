import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    if (accessToken) {
      login(accessToken)
        .then(() => {
          navigate('/');
        })
        .catch(err => {
          console.error("Failed to process login:", err);
          navigate('/login');
        });
    } else {
      // Handle error: no token provided
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">Authenticating, please wait...</p>
    </div>
  );
};

export default AuthCallbackPage;