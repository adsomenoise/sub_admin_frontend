import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className='bg-secondary-dark w-[20%] h-screen'>
      <nav className='flex flex-col py-4'>
        <ul className='flex flex-col gap-2'>
          <li className={`${isActive('/dashboard') ? 'bg-black text-white' : 'hover:underline'}`}>
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 w-full text-left rounded 
                `}
            >
              Dashboard
            </button>
          </li>
          <li className={`${isActive('/talents') ? 'bg-black text-white' : 'hover:underline'}`}>
            <button
              onClick={() => navigate('/talents')}
              className={`px-4 py-2 w-full text-left rounded`}
            >
              Talents
            </button>
          </li>
          <li className={`${isActive('/orders') ? 'bg-black text-white' : 'hover:underline'}`}>
            <button
              onClick={() => navigate('/orders')}
              className={`px-4 py-2 w-full text-left rounded`}
            >
              Orders
            </button>
          </li>
          <li className={`${isActive('/financials') ? 'bg-black text-white' : 'hover:underline'}`}>
            <button
              onClick={() => navigate('/financials')}
              className={`px-4 py-2 w-full text-left rounded`}
            >
              Financials
            </button>
          </li>
          <li className={`${isActive('/organize') ? 'bg-black text-white' : 'hover:underline'}`}>
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
              className="px-4 py-2 w-full text-left hover:underline text-white bg-red"
            >
              Log out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
