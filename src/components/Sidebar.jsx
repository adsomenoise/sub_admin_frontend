import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className='bg-gray-dark w-[20%] h-screen'>
      <nav className='flex flex-col py-4'>
        <ul className='flex flex-col gap-2'>
          <li className={`${isActive('/dashboard') ? 'bg-green text-black' : 'hover:underline'}`}>
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 w-full text-left rounded 
                `}
            >
              Dashboard
            </button>
          </li>
          <li className={`${isActive('/talents') ? 'bg-green text-black' : 'hover:underline'}`}>
            <button
              onClick={() => navigate('/talents')}
              className={`px-4 py-2 w-full text-left rounded`}
            >
              Talents
            </button>
          </li>
          <li className={`${isActive('/orders') ? 'bg-green text-black' : 'hover:underline'}`}>
            <button
              onClick={() => navigate('/orders')}
              className={`px-4 py-2 w-full text-left rounded`}
            >
              Orders
            </button>
          </li>
          <li className={`${isActive('/organize') ? 'bg-green text-black' : 'hover:underline'}`}>
            <button
              onClick={() => navigate('/organize')}
              className={`px-4 py-2 w-full text-left rounded `}
            >
              Organize
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                localStorage.removeItem('jwt');
                navigate('/login');
              }}
              className="px-4 py-2 w-full text-left hover:underline text-white bg-red-600"
            >
              Uitloggen
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
