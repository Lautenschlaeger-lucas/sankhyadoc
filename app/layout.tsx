import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Jornada de Implantação | Magis5 + Sankhya',description:'Etapas, orientações e requisitos para a implantação do Magis5 integrado ao Sankhya.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
