'use client';
import {ArrowRight, BookOpen, Code2, Check} from 'lucide-react';

export function IntegrationHome({onSelect}:{onSelect:(mode:string)=>void}) {
  return <div className="integration-home">
    <a className="skip" href="#choose-integration">Pular para o conteúdo</a>
    <header className="portal-header"><img src="brand/magis5-light.webp" alt="Magis5 by Sankhya"/><span><BookOpen size={16}/> Central de implantação</span></header>
    <main id="choose-integration" className="portal-main">
      <div className="portal-intro"><span className="portal-kicker">CONECTE SUA OPERAÇÃO</span><h1>Qual é o seu tipo<br/>de integração?</h1><p>Escolha como sua empresa se conecta ao Magis5.<br/>Vamos mostrar o caminho certo para você.</p></div>
      <div className="integration-choices">
        <button className="integration-choice choice-sankhya" onClick={()=>onSelect('sankhya')}>
          <div className="choice-visual" aria-hidden="true"><span className="choice-node choice-brand choice-brand-sankhya"><img src="brand/sankhya.jpg" alt=""/></span><span className="choice-connection"/><span className="choice-destination choice-brand"><img src="brand/magis5-light.webp" alt=""/></span></div>
          <div className="choice-content"><span className="choice-category">PARA QUEM USA O ERP SANKHYA</span><h2>Integração Sankhya</h2><p>Prepare os acessos, configure o Gateway e acompanhe cada etapa da implantação.</p><ul><li><Check size={15}/>Configuração passo a passo</li><li><Check size={15}/>Produtos, pedidos e estoque</li></ul><span className="choice-cta">Acessar guia Sankhya <ArrowRight size={20}/></span></div>
        </button>
        <button className="integration-choice choice-api" onClick={()=>onSelect('api')}>
          <div className="choice-visual" aria-hidden="true"><span className="choice-node"><Code2 size={34}/></span><span className="choice-connection"/><span className="choice-destination choice-brand"><img src="brand/magis5-light.webp" alt=""/></span></div>
          <div className="choice-content"><span className="choice-category">PARA SISTEMAS E DESENVOLVIMENTO PRÓPRIO</span><h2>API Magis5</h2><p>Conecte seu sistema ao Magis5 com os guias de desenvolvimento e a documentação da API.</p><ul><li><Check size={15}/>Endpoints e exemplos de integração</li><li><Check size={15}/>Collection pronta para o Postman</li></ul><span className="choice-cta">Acessar guia da API <ArrowRight size={20}/></span></div>
        </button>
      </div>
      <p className="portal-help">Você pode voltar a esta tela e trocar a integração a qualquer momento.</p>
    </main>
    <footer className="portal-footer"><span>Magis5 <b>by Sankhya</b></span><span>Da configuração à operação.</span></footer>
  </div>;
}
