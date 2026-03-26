import React from 'react';

const CodingBattlePage = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-black text-white p-4 font-sans'>
      <div className='text-center space-y-4'>
        <h1 className='text-5xl font-extrabold tracking-tighter sm:text-7xl bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent'>
          CodingBattlePage
        </h1>
        <p className='text-lg text-gray-400'>
          Dynamic Route: /arena/match/[matchId]
        </p>
        <div className='mt-8 h-1 w-24 bg-blue-500 mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]'></div>
      </div>
    </div>
  );
};

export default CodingBattlePage;
