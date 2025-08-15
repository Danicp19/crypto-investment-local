export const metadata = {
  title: 'CryptoInvestment',
  description: 'Seguimiento de criptomonedas',
};

import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
