import React, { useEffect, useState } from 'react';
import axios from 'axios';


function Financials() {
  const [loading, setLoading] = useState(true);
  const [newOrders, setNewOrders] = useState([]);
  const [inProgressOrders, setInProgressOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1337';

  const jwt = localStorage.getItem('jwt');

  useEffect(() => {
    if (!jwt) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        // Alleen BETAALDE orders ophalen voor financials
        let ordersRes;
        try {
          ordersRes = await axios.get(
            `${API_BASE_URL}/api/orders?filters[paymentStatus][$eq]=paid&sort=createdAt:desc&populate=*`,
            {
              headers: { Authorization: `Bearer ${jwt}` },
            }
          );
        } catch (authError) {
          ordersRes = await axios.get(
            `${API_BASE_URL}/api/orders?filters[paymentStatus][$eq]=paid&sort=createdAt:desc&populate=*`
          );
        }

        const allOrders = ordersRes.data.data || [];

        // Filter orders die nog geen video hebben
        const ordersWithoutVideo = allOrders.filter(order => {
          const hasVideo = order.orderVideo && 
            ((!Array.isArray(order.orderVideo) && order.orderVideo) || 
             (Array.isArray(order.orderVideo) && order.orderVideo.length > 0));
          
          return !hasVideo;
        });

        // Filter orders die wel video hebben
        const ordersWithVideo = allOrders.filter(order => {
          const hasVideo = order.orderVideo && 
            ((!Array.isArray(order.orderVideo) && order.orderVideo) || 
             (Array.isArray(order.orderVideo) && order.orderVideo.length > 0));
          
          return hasVideo;
        });

        setNewOrders(ordersWithoutVideo.filter(o => o.statusorder === 'nieuw'));
        setInProgressOrders(ordersWithoutVideo.filter(o => o.statusorder === 'behandeling'));
        setDeliveredOrders(ordersWithVideo);
        
      } catch (error) {
        console.error('Fout bij ophalen orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [jwt, API_BASE_URL]);

  if (loading) return <div>Laden...</div>;

    return (
        <div className="bg-gray w-[60%] rounded-blocks mx-auto p-8 h-[80vh] mt-8">
            <h1 className="text-3xl font-bold mb-6 ml-8">Finances</h1>
            <div className='pt-0 py-4'>
                <div className='flex flex-1 justify-evenly'>
                  <div className='flex mt-4 2xl:mt-8 gap-8'>
                    <div className='flex flex-col gap-1 2xl:gap-3 items-center'>
                      <h2 className='font-bold text-3xl 2xl:text-4xl'>{newOrders.length + inProgressOrders.length}</h2>
                      <p className='font-light'>Open Orders</p>
                    </div>
                    <div className="flex flex-col gap-1 2xl:gap-3 items-center">
                      <h2 className='font-bold text-2xl 2xl:text-3xl'>€{([...newOrders, ...inProgressOrders].reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0)).toFixed(2)}</h2>
                      <p className='font-light'>Open revenue</p>
                    </div>
                  </div>
                  <hr className='h-[100px] my-auto w-[1px] bg-black'/>
                  <div className="flex mt-4 2xl:mt-8 gap-8">
                    <div className='flex flex-col gap-1 2xl:gap-3 items-center'>
                      <h2 className='font-bold text-3xl 2xl:text-4xl'>{deliveredOrders.length}</h2>
                      <p className='font-light'>Delivered orders</p>
                    </div>
                    <div className='flex flex-col gap-1 2xl:gap-3 items-center'>
                      <h2 className='font-bold text-2xl 2xl:text-3xl'>€{(deliveredOrders.reduce((sum, order) => sum + (parseFloat(order.totalPrice) || 0), 0)).toFixed(2)}</h2>
                      <p className='font-light'>Total revenue</p>
                    </div>
                  </div>
                </div>
            </div>
            <div className='bg-white rounded-blocks w-full p-8 mb-4'>
                <h3>Invoices</h3>
                
            </div>
        </div>
    );
}

export default Financials;
