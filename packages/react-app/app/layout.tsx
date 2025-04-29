import '@/styles/globals.css';

import { AppProvider } from '@/providers/AppProvider';
import { Web3Provider } from '@/contexts/methodsWeb3';
import { ToastProvider } from '@/components/ui/ToastProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Web3Provider>
            <ToastProvider>{children}</ToastProvider>
          </Web3Provider>
        </AppProvider>
      </body>
    </html>
  );
}
