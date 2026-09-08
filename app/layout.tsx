import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Claudia & Jorge · Una carta para ti',description:'Tenemos algo que contarles. Abre nuestra carta.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="es"><body>{children}</body></html>}
