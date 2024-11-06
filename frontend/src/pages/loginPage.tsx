
import { useState } from 'react';
import LoginForm from '../components/loginForm';
import CreateUserForm from '../components/createUser';


const LoginPage = () => {
  const [activeComponent, setActiveComponent] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setActiveComponent('login')}
            className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
              activeComponent === 'login'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveComponent('register')}
            className={`px-6 py-2 rounded-lg font-medium transition duration-200 ${
              activeComponent === 'register'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Register
          </button>
        </div>
        {activeComponent === 'login' ? <LoginForm /> : <CreateUserForm />}
      </div>
    </div>
  );
};



export default LoginPage;
