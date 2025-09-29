import React, { useEffect, useState } from 'react';
import axios from 'axios';


function Financials() {

    return (
        <div className="bg-gray w-blocks mx-auto rounded-blocks p-8 min-h-screen">
            <div className='bg-white w-full h-full p-8 rounded-blocks'>
                <h2 className="font-bold text-2xl mb-6">Financial Overview</h2>
                <hr className='border-gray mb-6' />
                <p className="text-gray-600">Here you can find the financial details...</p>
            </div>
            
        </div>
    );
}

export default Financials;
