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
          <img src={`${import.meta.env.BASE_URL}images/logo.svg`} width={150} height={30} alt="logo" />
        </Link>
          <ul className='flex gap-4'>
            <li className={`${isActive('/dashboard') ? 'bg-green' : 'bg-white hover:bg-white/80 transition-colors duration-300'}  rounded-blocks`}>
              <button
                onClick={() => navigate('/dashboard')}
                className={`cursor-pointer px-6 py-2 w-full text-left rounded active:scale-90 transition-transform`}
              >
                Home
              </button>
            </li>
            <li className={`${isActive('/talents') ? 'bg-green' : 'bg-white hover:bg-white/80 transition-colors duration-300'}  rounded-blocks`}>
              <button
                onClick={() => navigate('/talents')}
                className={`cursor-pointer px-6 py-2 w-full text-left rounded active:scale-90 transition-transform`}
              >
                Talents
              </button>
            </li>
            <li className={`${isActive('/orders') ? 'bg-green' : 'bg-white hover:bg-white/80 transition-colors duration-300'}  rounded-blocks`}>
              <button
                onClick={() => navigate('/orders')}
                className={`cursor-pointer px-6 py-2 w-full text-left rounded active:scale-90 transition-transform`}
              >
                Orders
              </button>
            </li>
            <li className={`${isActive('/financials') ? 'bg-green' : ' bg-white hover:bg-white/80 transition-colors duration-300'}  rounded-blocks`}>
              <button
                onClick={() => navigate('/financials')}
                className={`cursor-pointer px-6 py-2 w-full text-left rounded active:scale-90 transition-transform`}
              >
                Financials
              </button>
            </li>
            <li className={`${isActive('/organize') ? 'bg-green' : 'bg-white hover:bg-white/80 transition-colors duration-300'}  rounded-blocks`}>
              <button
                onClick={() => navigate('/organize')}
                className={`px-6 py-2 w-full text-left rounded cursor-pointer active:scale-90 transition-transform`}
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
                  localStorage.removeItem('team');
                  navigate('/login');
                }}
                className="px-6 py-2 w-full text-left bg-green rounded-blocks cursor-pointer"
              >
                Sign out
              </button>
        </div>
      </nav>
    </header>
  );
}

export default Navigation;
