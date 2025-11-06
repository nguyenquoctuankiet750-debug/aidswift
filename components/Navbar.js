'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: typeData } = await supabase
          .from('user_types')
          .select('type')
          .eq('user_id', user.id)
          .single();

        if (typeData) setUserType(typeData.type);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/images/placeholder-logo.png"
            alt="logo"
            width={40}
            height={40}
            className="rounded"
          />
          <Link href="/" className="text-2xl font-bold text-blue-600">
            AidSwift
          </Link>
        </div>

        {/* Menu chính */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
            Trang chủ
          </Link>
          <Link href="/sos" className="text-gray-700 hover:text-blue-600 transition">
            Khẩn cấp
          </Link>
          <Link href="/jobs" className="text-gray-700 hover:text-blue-600 transition">
            Việc làm
          </Link>
          <Link href="/support" className="text-gray-700 hover:text-blue-600 transition">
            Hỗ trợ
          </Link>
          {!user ? (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Đăng nhập
            </Link>
          ) : (
            <>
              <Link
                href={
                  userType === 'company'
                    ? '/profile/company'
                    : '/profile/user'
                }
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Hồ sơ của tôi
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>

        {/* Nút menu mobile */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div className="md:hidden bg-blue-50 text-center py-4 space-y-3">
          <Link href="/" className="block text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
            Trang chủ
          </Link>
          <Link href="/sos" className="block text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
            Khẩn cấp
          </Link>
          <Link href="/jobs" className="block text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
            Việc làm
          </Link>

          {!user ? (
            <Link
              href="/login"
              className="block text-blue-600 font-semibold"
              onClick={() => setIsOpen(false)}
            >
              Đăng nhập
            </Link>
          ) : (
            <>
              <Link
                href={
                  userType === 'company'
                    ? '/profile/company'
                    : '/profile/user'
                }
                className="block text-blue-600 font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Hồ sơ của tôi
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block text-red-500 font-semibold w-full"
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
