import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Central de Implantação | Magis5',description:'Guias de implantação e integração do Magis5 com Sankhya e com a API pública.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
