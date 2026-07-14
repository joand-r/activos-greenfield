"use client";
import Image from "next/image";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 overflow-hidden border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a] py-8 md:py-12">
      <style>{`
        @keyframes shieldBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
        .animate-shield-bob {
          animation: shieldBob 3.5s ease-in-out infinite;
        }
      `}</style>
      
      <div className="container relative">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8">
          
          {/* Columna Izquierda: Logo y Dirección */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <div className="relative group cursor-pointer transition-transform duration-300 hover:scale-105">
              <Image
                src="/images/logo/greenfield-negro.png"
                alt="Greenfield"
                className="dark:hidden"
                width={130}
                height={37}
                style={{ height: "auto" }}
              />
              <Image
                src="/images/logo/greenfield-blanco.png"
                alt="Greenfield"
                className="hidden dark:block"
                width={130}
                height={37}
                style={{ height: "auto" }}
              />
            </div>
            
            <div className="text-xs text-body-color/80 dark:text-gray-400 space-y-1 font-medium">
              <p className="hover:text-primary transition-colors duration-200">Av. Cristo Redentor 8vo anillo</p>
              <p className="hover:text-primary transition-colors duration-200">Edificio El Remanso</p>
              <p className="hover:text-primary transition-colors duration-200">Santa Cruz de la Sierra, Bolivia</p>
            </div>
          </div>

          {/* Columna Central: Escudo Interactivo Animado */}
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="animate-shield-bob group cursor-pointer relative">
              {/* Glow back-layer */}
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-125" />
              
              <svg 
                className="w-14 h-14 text-primary relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:text-primary/90 filter drop-shadow-[0_4px_8px_rgba(74,108,247,0.15)] group-hover:drop-shadow-[0_8px_16px_rgba(74,108,247,0.35)]" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Shield Body */}
                <path 
                  d="M50 8 L85 22 C85 58 50 88 50 88 C50 88 15 58 15 22 Z" 
                  fill="url(#footerShieldGrad)" 
                  stroke="currentColor" 
                  strokeWidth="3.5" 
                  strokeLinejoin="round"
                />
                {/* Inner Shield Ribs / Segments */}
                <path 
                  d="M50 8 V88" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeDasharray="2 3" 
                  opacity="0.3"
                />
                {/* Center Symbol: Elegant stylized house roof + leaf */}
                <path 
                  d="M32 48 L50 32 L68 48 M50 38 V65" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M38 60 C42 54 48 54 50 60 C52 54 58 54 62 60" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                
                <defs>
                  <linearGradient id="footerShieldGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4A6CF7" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#4A6CF7" stopOpacity="0.25" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-body-color/30 dark:text-gray-600 transition-colors duration-300 group-hover:text-primary">
              Greenfield Bolivia
            </span>
          </div>

          {/* Columna Derecha: Información de Contacto */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-body-color/40 dark:text-gray-600">
              Canales de Atención
            </h4>
            
            <div className="text-xs space-y-3 font-semibold text-black dark:text-white">
              <a 
                href="mailto:info@greenfield.com.bo" 
                className="flex items-center gap-2 md:justify-end text-body-color/80 dark:text-gray-400 hover:text-primary transition-colors duration-200"
              >
                <span>info@greenfield.com.bo</span>
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
              <a 
                href="tel:+59133429226" 
                className="flex items-center gap-2 md:justify-end text-body-color/80 dark:text-gray-400 hover:text-primary transition-colors duration-200"
              >
                <span>(+591) 33429226</span>
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Separador */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent my-6" />

        {/* Barra de copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 text-center sm:text-left">
          <p className="text-[10px] text-body-color/55 dark:text-gray-600">
            © {year} <span className="font-semibold text-body-color/70 dark:text-gray-500">Greenfield S.A.C.</span> — Todos los derechos reservados.
          </p>
          <p className="text-[9px] text-body-color/45 dark:text-gray-700 uppercase tracking-wider">
            Sistema de Gestión de Activos — Uso interno
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
