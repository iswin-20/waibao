import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: '歪宝小窝',
  description: '专属于歪宝的 AI 情绪陪伴 + 生活记录 + 情侣联动',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF9B9B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gradient-warm">
        <AuthProvider>
          <main className="max-w-md mx-auto min-h-screen relative pb-20">
            {children}
          </main>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '16px',
                background: '#FFF8F0',
                color: '#4A4A4A',
                boxShadow: '0 4px 14px rgba(255, 155, 155, 0.2)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
