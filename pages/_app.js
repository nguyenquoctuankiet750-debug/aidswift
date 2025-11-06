// pages/_app.js
import 'leaflet/dist/leaflet.css';
import '../styles/globals.css';
import { useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import FloatingChat from '../components/FloatingChat'; // 🔹 Thêm dòng này

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Lắng nghe auth changes và ghi session thủ công (dự phòng)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        try {
          localStorage.setItem('supabase.auth.session', JSON.stringify(session));
        } catch (e) {
          console.warn('Cannot write session to localStorage', e);
        }
      } else {
        try {
          localStorage.removeItem('supabase.auth.session');
        } catch (e) {
          /* ignore */
        }
      }
    });

    return () => {
      // unsubscribe
      listener.subscription?.unsubscribe();
    };
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <FloatingChat /> {/* 🔹 Bong bóng chat hiển thị ở mọi trang */}
    </>
  );
}
