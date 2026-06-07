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

const fallbackCss = `
  html,body{margin:0;min-height:100%;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#4a3f3f;background:#fff4f4}
  body{background:linear-gradient(135deg,#ffe4e4 0%,#fff7f7 48%,#fff1cf 100%)}
  button,input,textarea,select{font:inherit}
  button{cursor:pointer}
  h1,h2,h3,p{margin:0}
  svg{display:block}
  .max-w-md{max-width:28rem}
  .mx-auto{margin-left:auto;margin-right:auto}
  .min-h-screen{min-height:100vh}
  .relative{position:relative}
  .fixed{position:fixed}
  .inset-0{inset:0}
  .flex{display:flex}
  .grid{display:grid}
  .hidden{display:none}
  .items-center{align-items:center}
  .justify-center{justify-content:center}
  .justify-between{justify-content:space-between}
  .flex-col{flex-direction:column}
  .gap-1{gap:.25rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}
  .p-4{padding:1rem}.p-5{padding:1.25rem}.px-4{padding-left:1rem;padding-right:1rem}.pt-4{padding-top:1rem}.pb-20{padding-bottom:5rem}.mb-4{margin-bottom:1rem}.mt-2{margin-top:.5rem}.mt-3{margin-top:.75rem}
  .rounded-full{border-radius:9999px}.rounded-2xl{border-radius:1rem}.rounded-3xl{border-radius:1.5rem}
  .bg-white{background:#fff}.bg-gradient-warm{background:linear-gradient(135deg,#ffe4e4 0%,#fff7f7 48%,#fff1cf 100%)}
  .text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}
  .font-bold{font-weight:700}.font-medium{font-weight:500}
  .text-waibao-text{color:#4a3f3f}.text-waibao-text-light{color:#9a8585}.text-waibao-primary{color:#ff8fa3}
  .shadow-soft{box-shadow:0 8px 24px rgba(170,95,95,.12)}.shadow-colored{box-shadow:0 10px 22px rgba(255,143,163,.28)}
  .waibao-card,.glass{background:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.65);box-shadow:0 8px 24px rgba(170,95,95,.12);backdrop-filter:blur(14px)}
  .waibao-card{border-radius:1.5rem;padding:1.25rem}
  .waibao-btn-primary{border:0;border-radius:1rem;padding:.75rem 1.5rem;font-weight:600;color:#fff;background:linear-gradient(135deg,#ff8fa3,#ffb36b);box-shadow:0 10px 22px rgba(255,143,163,.28)}
  .waibao-btn-secondary{border:1px solid #ffd6dd;border-radius:1rem;padding:.75rem 1.5rem;font-weight:600;color:#4a3f3f;background:#fff}
  .waibao-input{width:100%;box-sizing:border-box;border:2px solid rgba(255,214,221,.7);border-radius:1rem;background:#fff;padding:.75rem 1rem;color:#4a3f3f;outline:none}
  .nav-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.125rem;color:#9a8585;text-decoration:none}
  .nav-item svg{width:1.5rem;height:1.5rem}.nav-item span{font-size:.75rem}.nav-item.active{color:#ff8fa3}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <style dangerouslySetInnerHTML={{ __html: fallbackCss }} />
      </head>
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
