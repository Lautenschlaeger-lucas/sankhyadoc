'use client';
import {ThemeToggle} from './theme-toggle';
import {ArrowRight, BookOpen, Code2, Check, Route, Layers, Cable} from 'lucide-react';

export function IntegrationHome({onSelect}:{onSelect:(mode:string)=>void}) {
  return <div className="integration-home">
    <a className="skip" href="#choose-integration">Pular para o conteúdo</a>
    <header className="portal-header"><img src="brand/magis5-light.webp" alt="Magis5 by Sankhya"/><div className="portal-header-actions"><span><BookOpen size={16}/> Central de implantação</span><ThemeToggle/></div></header>
    <main id="choose-integration" className="portal-main">
      <section className="portal-intro">
        <div><span className="portal-kicker">CENTRAL DE IMPLANTAÇÃO</span><h1>Sua operação conectada.<br/><em>Seu próximo passo, aqui.</em></h1></div>
        <p>Da primeira configuração aos primeiros pedidos. Encontre as orientações para integrar sua empresa ao Magis5 com clareza, em cada etapa.</p>
      </section>
      <div className="portal-choice-heading"><h2>Como você vai se conectar?</h2><span>Escolha o caminho da sua empresa</span></div>
      <div className="integration-choices">
        <button className="integration-choice choice-sankhya" onClick={()=>onSelect('sankhya')}>
          <div className="choice-visual" aria-hidden="true"><span className="choice-symbol"><Cable size={26}/></span><span className="choice-path">ERP + MAGIS5</span><span className="choice-index">01</span></div>
          <div className="choice-content"><span className="choice-category">PARA QUEM USA O ERP SANKHYA</span><h2>Integração Sankhya</h2><p>Prepare seu ERP e acompanhe a implantação, da configuração do Gateway à operação.</p><ul><li><Check size={16}/>Integração automática ou manual</li><li><Check size={16}/>Produtos, pedidos e estoque</li></ul><span className="choice-cta">Explorar a integração <ArrowRight size={20}/></span></div>
        </button>
        <button className="integration-choice choice-api" onClick={()=>onSelect('api')}>
          <div className="choice-visual" aria-hidden="true"><span className="choice-symbol"><Code2 size={26}/></span><span className="choice-path">SEU SISTEMA + MAGIS5</span><span className="choice-index">02</span></div>
          <div className="choice-content"><span className="choice-category">PARA EQUIPES DE DESENVOLVIMENTO</span><h2>API Magis5</h2><p>Construa a conexão com seu sistema usando a documentação e os exemplos da nossa API.</p><ul><li><Check size={16}/>Endpoints e guias de desenvolvimento</li><li><Check size={16}/>Requisições prontas para o Postman</li></ul><span className="choice-cta">Explorar a API <ArrowRight size={20}/></span></div>
        </button>
      </div>
      <section className="portal-assurance" aria-label="Sobre a central"><div><Route size={20}/><p><strong>Um caminho organizado</strong><span>Orientações para cada etapa da implantação.</span></p></div><div><Layers size={20}/><p><strong>Tudo no mesmo lugar</strong><span>Guias, configurações e referência técnica.</span></p></div><p className="portal-help">Você pode trocar de integração<br/>a qualquer momento.</p></section>
    </main>
    <footer className="portal-footer"><span>Magis5 <b>by Sankhya</b></span><span>Da configuração à operação.</span></footer>
  </div>;
}
