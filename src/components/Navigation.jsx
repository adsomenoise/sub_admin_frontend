import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Navigation() {

  return (
    <header className='bg-secondary-dark'>
      <nav className='flex justify-between items-center w-blocks mx-auto py-6'>
        <Link to='/' className='flex gap-2 items-center'>
          <img src="/images/logo.svg" width={150} height={30} alt="logo" />
        </Link>

        <div>
            <p>Fanflix admin</p>
        </div>
      </nav>
    </header>
  );
}

export default Navigation;
