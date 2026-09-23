'use client';
import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
import './dark-theme.css';
export function ThemeToggle(){
  const [dark,setDark]=useState(false);
  useEffect(()=>{
    const sync=()=>setDark(document.documentElement.dataset.theme==='dark');
    sync();window.addEventListener('magis-theme-change',sync);
    return()=>window.removeEventListener('magis-theme-change',sync);
  },[]);
  function toggle(){
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    document.documentElement.dataset.theme=next;
    try{localStorage.setItem('magis5-theme',next);}catch{/* Theme remains usable when storage is unavailable. */}
    window.dispatchEvent(new Event('magis-theme-change'));
  }
  return <button type="button" className="theme-toggle" onClick={toggle} aria-label={dark?'Ativar modo claro':'Ativar modo escuro'} title={dark?'Ativar modo claro':'Ativar modo escuro'}>{dark?<Sun size={18}/>:<Moon size={18}/>}<span>{dark?'Modo claro':'Modo escuro'}</span></button>;
}
