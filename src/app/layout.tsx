// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { CartSidebarGlobal } from '@/components/cart/CartSidebarGlobal';
import ServiceWorkerRegister from '@/components/pwa/ServiceWorkerRegister';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Foodie - Delivery de Comida',
    description: 'Peça comida dos melhores restaurantes da sua região',
    manifest: '/manifest.json',
    icons: {
        icon: [
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [
            { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Foodie',
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: 'website',
        siteName: 'Foodie',
        title: 'Foodie - Delivery de Comida',
        description: 'Peça comida dos melhores restaurantes da sua região',
    },
};

export const viewport: Viewport = {
    themeColor: '#00A082',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    <Header />
                    <main className="min-h-screen pb-20 lg:pb-0">
                        {children}
                    </main>
                    <BottomNav />
                    <CartSidebarGlobal />
                    <Toaster
                        position="top-center"
                        richColors
                        toastOptions={{
                            style: {
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text)',
                            },
                        }}
                    />
                    <ServiceWorkerRegister />
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}