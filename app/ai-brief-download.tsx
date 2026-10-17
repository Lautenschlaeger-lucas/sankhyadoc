import {Download, Sparkles} from 'lucide-react';

export function AiBriefDownload() {
  return <aside className="ai-brief-download" aria-label="Desenvolvimento com IA">
    <div className="ai-brief-icon"><Sparkles size={22} aria-hidden="true"/></div>
    <div className="ai-brief-copy"><strong>Leve este guia para sua IA</strong><p>Baixe o desenvolvimento sugerido, os contratos da API e um roteiro para programar a integração no seu projeto. Anexe o TXT à sua IA para começar.</p><small>A IA precisará conhecer seu sistema. Valide o código e os testes antes de colocar em produção.</small></div>
    <a className="docs-button" href="api-data/magis5-guia-para-ia.txt" download><Download size={16} aria-hidden="true"/>Baixar guia para IA (.txt)</a>
  </aside>;
}
