import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className=''>
      <nav className='flex justify-between items-center w-smallblocks mx-auto py-6'>
        <Link to='/' className='flex gap-2 items-center'>
          <img src="/images/logo.svg" width={150} height={30} alt="logo-svg" />
        </Link>
          <ul className='flex gap-4'>
            <li className={`${isActive('/dashboard') ? 'bg-green' : 'hover:underline bg-white'}  rounded-blocks`}>
              <button
                onClick={() => navigate('/dashboard')}
                className={`cursor-pointer px-6 py-2 w-full text-left rounded hover:underline`}
              >
                Home
              </button>
            </li>
            <li className={`${isActive('/talents') ? 'bg-green' : 'hover:underline bg-white'}  rounded-blocks`}>
              <button
                onClick={() => navigate('/talents')}
                className={`cursor-pointer px-6 py-2 w-full text-left rounded hover:underline`}
              >
                Talents
              </button>
            </li>
            <li className={`${isActive('/orders') ? 'bg-green' : 'hover:underline bg-white'}  rounded-blocks`}>
              <button
                onClick={() => navigate('/orders')}
                className={`cursor-pointer px-6 py-2 w-full text-left rounded hover:underline`}
              >
                Orders
              </button>
            </li>
            <li className={`${isActive('/financials') ? 'bg-green' : 'hover:underline bg-white'}  rounded-blocks`}>
              <button
                onClick={() => navigate('/financials')}
                className={`cursor-pointer px-6 py-2 w-full text-left rounded hover:underline`}
              >
                Financials
              </button>
            </li>
            <li className={`${isActive('/organize') ? 'bg-green' : 'bg-white'}  rounded-blocks`}>
              <button
                onClick={() => navigate('/organize')}
                className={`px-6 py-2 w-full text-left rounded hover:underline cursor-pointer`}
              >
                Setup
              </button>
            </li>
          </ul>
        <div>
            <button
                onClick={() => {
                  localStorage.removeItem('jwt');
                  localStorage.removeItem('user');
                  navigate('/login');
                }}
                className="px-6 py-2 w-full text-left hover:underline bg-green rounded-blocks cursor-pointer"
              >
                Sign out
              </button>
        </div>
      </nav>
    </header>
  );
}

export default Navigation;
