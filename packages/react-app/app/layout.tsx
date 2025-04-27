import '@/styles/globals.css';

import { AppProvider } from '@/providers/AppProvider';
import { Web3Provider } from '@/contexts/methodsWeb3';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Web3Provider>{children}</Web3Provider>
        </AppProvider>
      </body>
    </html>
  );
}
