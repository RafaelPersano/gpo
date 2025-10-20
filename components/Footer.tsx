
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400">
        <div className="container mx-auto px-6 py-12 text-center">
            <a href="#" className="text-3xl font-bold text-white">GPO<span className="text-blue-500">.</span></a>
            <p className="mt-4 max-w-md mx-auto">Otimizando a construção civil com o poder da Inteligência Artificial.</p>
            <p className="mt-8 text-sm">&copy; {new Date().getFullYear()} GPO. Todos os direitos reservados.</p>
        </div>
    </footer>
  );
};

export default Footer;