import Image from 'next/image';

export default function Banner() {
  return (
    <div className='relative w-full h-72'>
      <Image src='/images/placeholder-banner.jpg' alt='banner' fill style={{ objectFit: 'cover' }} />
      <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
        <div className='text-center text-white'>
          <h1 className='text-4xl font-bold'>AidSwift — Emergency & Jobs</h1>
          <p className='mt-2'>Quick help, better jobs — all in one place.</p>
        </div>
      </div>
    </div>
  );
}
