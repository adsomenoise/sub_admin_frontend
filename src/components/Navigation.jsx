import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {

  return (
    <header className='bg-gray-dark'>
      <nav className='flex justify-between items-center w-blocks mx-auto py-6'>
        <Link to='/' className='flex gap-2 items-center'>
          <img src="/images/logo.svg" alt="logo" />
        </Link>

        <div>
            <p>Fanflix admin</p>
        </div>
      </nav>
    </header>
  );
}

export default Navigation;
