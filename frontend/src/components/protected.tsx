import { FC, useEffect, useState } from 'react';
import { checkUserLogin, User } from '../services/checkUserLogin';
import { useNavigate } from 'react-router-dom';

interface ProtectedProps {
  children: React.ReactNode | ((data: any) => React.ReactNode);
}

export const Protected: FC<ProtectedProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User|null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await checkUserLogin();
      if (!response.success) {
        navigate('/login');
      }
      setUser(response.user);
      setIsLoading(false);
    };

    checkAuth();
  }, []); 

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{typeof children === 'function' ? children(user) : children}</>;
};