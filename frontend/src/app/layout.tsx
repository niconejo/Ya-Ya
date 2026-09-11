import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ya-Ya',
  description: 'Red social y marketplace para emprendedores de servicios',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
