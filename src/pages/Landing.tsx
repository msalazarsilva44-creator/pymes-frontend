import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// --- STYLES & ANIMATIONS ---
const CUSTOM_STYLES = `
@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}

@keyframes blink {
  0%, 100% { opacity: 1 }
  50% { opacity: 0 }
}

@keyframes shimmer {
  0% { transform: translateX(-100%) }
  100% { transform: translateX(100%) }
}

@keyframes float {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(-10px) }
}

.brand-gradient {
  background: linear-gradient(135deg, #0F3D6E 0%, #1D6FAD 50%, #00B4D8 100%);
}

.animate-typing {
  overflow: hidden;
  white-space: nowrap;
  animation: typing 3.5s steps(30, end);
}

@media (max-width: 640px) {
  .animate-typing {
    white-space: normal;
    animation: none;
    overflow: visible;
  }
  .cursor-blink {
    display: none;
  }
}

.cursor-blink {
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: #00B4D8;
  margin-left: 2px;
  animation: blink 1s infinite;
}

.animate-shimmer {
  position: relative;
  overflow: hidden;
}

.animate-shimmer::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transform: translateX(-100%);
}

.animate-shimmer:hover::after {
  animation: shimmer 0.8s forwards;
}

.reveal-hidden {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.reveal-visible {
  opacity: 1;
  transform: translateY(0);
}

.border-gradient {
  position: relative;
  background: white;
  background-clip: padding-box;
  border: 2px solid transparent;
  border-radius: 1rem;
}

.border-gradient::before {
  content: '';
  position: absolute;
  top: -2px; bottom: -2px; left: -2px; right: -2px;
  z-index: -1;
  border-radius: inherit;
  background: linear-gradient(135deg, #0F3D6E, #00B4D8);
}
`;

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('Todo');
  const [isSearching, setIsSearching] = useState(false);

  // --- REVEAL ANIMATION LOGIC ---
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
        }
      });
    }, { threshold: 0.1 });

    revealRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const addToReveal = (el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  // --- SCROLL LISTENER for Navbar shadow ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- HANDLERS ---
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (searchCategory !== 'Todo') params.set('tipo', searchCategory.toLowerCase());
    setTimeout(() => {
      setIsSearching(false);
      navigate(`/marketplace${params.toString() ? '?' + params.toString() : ''}`);
    }, 400);
  };

  // --- SVG ICONS ---
  const Icons = {
    Logo: () => (
      <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5L90 30V70L50 95L10 70V30L50 5Z" fill="url(#brand-grad)" />
        <path d="M50 25L70 40V60L50 75L30 60V40L50 25Z" fill="white" fillOpacity="0.3" />
        <path d="M50 40L60 48V52L50 60L40 52V48L50 40Z" fill="white" />
        <defs>
          <linearGradient id="brand-grad" x1="10" y1="5" x2="90" y2="95" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F3D6E" />
            <stop offset="0.5" stopColor="#1D6FAD" />
            <stop offset="1" stopColor="#00B4D8" />
          </linearGradient>
        </defs>
      </svg>
    ),
    ChevronDown: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    ),
    Search: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    ),
    Check: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17L4 12"/></svg>
    ),
    Menu: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
    ),
    X: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    ),
    ArrowRight: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    )
  };

  return (
    <div className="font-sans text-[#1E2A3A] bg-white selection:bg-[#00B4D8] selection:text-white overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: CUSTOM_STYLES }} />

      {/* --- HEADER --- */}
      <header className={`fixed top-0 w-full z-50 h-16 transition-all duration-300 border-b backdrop-blur-md bg-white/95 ${isScrolled ? 'shadow-sm border-gray-100' : 'border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-10 h-10 brand-gradient rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-lg">M</div>
              <span className="text-2xl font-bold tracking-tight text-[#0F3D6E]">MERCAROF</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {['Inicio', 'Explorar', 'Vender', 'Planes', 'Contacto'].map((item, idx) => (
                item === 'Explorar' ? (
                  <Link
                    key={item}
                    to="/marketplace"
                    className="text-sm font-semibold transition-all relative text-[#0F3D6E] hover:text-[#1D6FAD] animate-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {item}
                  </Link>
                ) : (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`}
                    className={`text-sm font-semibold transition-all relative ${item === 'Inicio' ? 'text-[#1D6FAD] border-b-2 border-[#1D6FAD]' : 'text-[#0F3D6E] hover:text-[#1D6FAD]'} animate-in`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {item}
                  </a>
                )
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-5 py-2.5 rounded-full text-sm font-bold text-[#0F3D6E] hover:bg-gray-50 transition-colors active:scale-95">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="brand-gradient text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform active:scale-95 inline-block">
              Registrarse
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-[#0F3D6E]">
            {isMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-screen py-4 shadow-xl' : 'max-h-0'}`}>
          <div className="flex flex-col gap-3 px-6 pb-6">
            {['Inicio', 'Explorar', 'Vender', 'Planes', 'Contacto'].map((item) => (
              item === 'Explorar' ? (
                <Link key={item} to="/marketplace" className="text-lg font-semibold text-[#0F3D6E] py-2" onClick={() => setIsMenuOpen(false)}>{item}</Link>
              ) : (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-lg font-semibold text-[#0F3D6E] py-2" onClick={() => setIsMenuOpen(false)}>{item}</a>
              )
            ))}
            <div className="flex flex-col gap-2 mt-4">
              <Link to="/login" className="w-full px-6 py-4 rounded-xl font-bold text-[#0F3D6E] bg-gray-50 border border-gray-100 text-center block">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="w-full px-6 py-4 rounded-xl font-bold text-white brand-gradient shadow-lg text-center block">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[75vh] flex items-center pt-16 overflow-hidden brand-gradient text-white">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="diamond-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0L40 20L20 40L0 20Z" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#diamond-pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 px-2">
            Consigue lo que buscas <br />
            <span className="text-[#00B4D8] animate-typing inline-block">en menos de 30s<span className="cursor-blink"></span></span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto mb-8 px-2">
            Miles de productos y servicios al alcance de un clic. Conectamos compradores y vendedores en toda la región de forma segura y rápida.
          </p>

          <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row items-stretch gap-2 reveal-hidden reveal-visible" style={{ transitionDelay: '300ms' }}>
            <div className="flex-shrink-0 px-4 md:px-6 border-b md:border-b-0 md:border-r border-gray-200 hidden md:flex items-center">
              <select 
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="bg-transparent text-[#1E2A3A] text-sm font-semibold focus:outline-none cursor-pointer h-12"
              >
                <option>Todo</option>
                <option>Productos</option>
                <option>Servicios</option>
              </select>
            </div>
            
            <input 
              type="text" 
              placeholder="¿Qué estás buscando hoy?"
              className="flex-1 bg-transparent text-[#1E2A3A] px-4 md:px-6 py-3 md:py-4 focus:outline-none text-base md:text-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button 
              onClick={handleSearch}
              className="brand-gradient w-full md:w-auto px-6 md:px-10 py-3 md:py-4 rounded-xl font-bold text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Icons.Search />
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-4 mb-16 md:mb-20 px-4">
            <span className="text-xs text-white/60 font-medium uppercase tracking-widest">Popular:</span>
            {['Diseño web', 'Electrónica', 'Consultoría'].map((tag) => (
              <button 
                key={tag}
                onClick={() => setSearchTerm(tag)}
                className="text-xs text-white/90 underline hover:text-[#00B4D8] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 w-full flex flex-wrap justify-center gap-4 md:gap-12 text-xs md:text-sm font-medium border-t border-white/10 py-4 px-4">
            <div className="flex items-center gap-2"><span>10,000+ Productos</span></div>
            <div className="w-px h-4 bg-white/20 hidden md:block"></div>
            <div className="flex items-center gap-2"><span>5,000+ Vendedores</span></div>
            <div className="w-px h-4 bg-white/20 hidden md:block"></div>
            <div className="flex items-center gap-2"><span>99% Satisfacción</span></div>
          </div>
        </div>
      </section>

      {/* --- CATEGORIES --- */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-12">
            <div ref={addToReveal} className="reveal-hidden">
              <h2 className="text-2xl font-bold text-[#0F3D6E] mb-6">Categorías Populares</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: 'Tecnología', icon: '💻', count: '1,240 anuncios' },
                  { name: 'Hogar', icon: '🏠', count: '2,100 anuncios' },
                  { name: 'Servicios', icon: '⚙️', count: '2,400 anuncios' },
                  { name: 'Moda', icon: '👕', count: '1,500 anuncios' },
                  { name: 'Deportes', icon: '⚽', count: '600 anuncios' },
                  { name: 'Arte', icon: '🎨', count: '400 anuncios' }
                ].map((cat, idx) => (
                  <div 
                    key={idx}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-[#00B4D8] transition-all cursor-pointer group flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-[#1D6FAD]/10 text-2xl">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0F3D6E]">{cat.name}</h3>
                      <p className="text-xs text-[#6B7A90] font-medium">{cat.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps / How it works mini section */}
            <div ref={addToReveal} className="reveal-hidden p-6 rounded-2xl bg-[#F0F6FC] flex flex-col md:flex-row justify-between items-center gap-6 border border-gray-100 shadow-sm">
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-[#0F3D6E]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white text-[#1D6FAD] flex items-center justify-center shadow-sm">1</div>
                  <span>Busca lo que necesites</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full hidden md:block"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white text-[#1D6FAD] flex items-center justify-center shadow-sm">2</div>
                  <span>Conecta con el vendedor</span>
                </div>
                <div className="w-1 h-1 bg-gray-300 rounded-full hidden md:block"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white text-[#1D6FAD] flex items-center justify-center shadow-sm">3</div>
                  <span>Realiza tu transacción</span>
                </div>
              </div>
              <div className="text-xs text-[#1D6FAD] font-black cursor-pointer underline whitespace-nowrap">Ver cómo funciona &rarr;</div>
            </div>
          </div>

          {/* Pricing Sidebar */}
          <div className="col-span-12 lg:col-span-4 sticky top-24">
            <div 
              ref={addToReveal}
              className="relative bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/80 p-8 max-w-[400px] mx-auto flex flex-col gap-6 overflow-hidden reveal-hidden"
            >
              {/* Accent bar top */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: 'linear-gradient(to right, #1D6FAD, #00B4D8)' }} />

              {/* Badge + Toggle */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-white px-4 py-1.5 rounded-full shadow-md shadow-blue-200" style={{ background: 'linear-gradient(135deg, #1D6FAD, #00B4D8)' }}>Plan Mercarof Pro</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium uppercase tracking-wider transition-colors ${billingCycle === 'monthly' ? 'text-[#1D6FAD] font-bold' : 'text-gray-400'}`}>Mes</span>
                  <button 
                    onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    className={`w-11 h-6 rounded-full relative p-0.5 transition-colors duration-300 focus:outline-none ${billingCycle === 'yearly' ? 'bg-[#1D6FAD]' : 'bg-slate-200'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                  <span className={`text-xs font-medium uppercase tracking-wider transition-colors ${billingCycle === 'yearly' ? 'text-[#1D6FAD] font-bold' : 'text-gray-400'}`}>Año</span>
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-6xl font-bold text-[#0F3D6E]">
                    {billingCycle === 'monthly' ? '$2.00' : '$23.99'}
                  </span>
                  <span className="text-sm font-medium text-[#1D6FAD] uppercase">/{billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                </div>
                {billingCycle === 'yearly' && (
                  <span className="inline-block mt-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">Ahorra pagando anual</span>
                )}
              </div>

              {/* Benefits list */}
              <ul className="divide-y divide-slate-100">
                {[
                  'Publicaciones ilimitadas',
                  'Búsquedas destacadas',
                  'Panel de estadísticas',
                  'Badge de verificado'
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1D6FAD, #00B4D8)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className="w-full py-4 rounded-xl text-white font-bold text-base shadow-lg shadow-blue-300/50 transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #0F3D6E, #1D6FAD)' }}
              >
                Comenzar ahora
              </button>
              <p className="text-center text-xs text-slate-400">Sin contratos. Cancela cuando quieras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-24 bg-[#F0F6FC]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div ref={addToReveal} className="reveal-hidden text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0F3D6E] mb-4">Lo que dicen nuestros usuarios</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ricardo Alarcón', role: 'Vendedor Electrónica', text: 'Desde que uso el Plan Pro de Mercarof, mis ventas han aumentado un 40% mensual. El soporte es increíble.', initial: 'R' },
              { name: 'Sofía Méndez', role: 'Diseñadora Freelance', text: 'La mejor plataforma para ofrecer servicios digitales en la región. Rápida, intuitiva y con mucha visibilidad.', initial: 'S' },
              { name: 'Javier Torres', role: 'Comprador Recurrente', text: 'Busco repuestos y servicios técnicos aquí siempre. La confianza que dan los perfiles verificados es clave.', initial: 'J' }
            ].map((testi, idx) => (
              <div 
                key={idx}
                ref={addToReveal}
                className="reveal-hidden p-8 bg-white rounded-2xl shadow-lg border border-[#1D6FAD]/5 hover:shadow-2xl transition-all"
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0F3D6E] to-[#00B4D8] flex items-center justify-center text-white font-black text-xl shadow-lg">
                    {testi.initial}
                  </div>
                  <div>
                    <h4 className="font-black text-[#0F3D6E]">{testi.name}</h4>
                    <p className="text-xs font-bold text-[#00B4D8] uppercase">{testi.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed">"{testi.text}"</p>
                <div className="mt-6 flex text-yellow-400">
                   {[...Array(5)].map((_, i) => (
                     <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="w-full bg-[#0F3D6E] text-white/60 py-5 px-4 md:px-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] z-[40] mt-4">
        <div>
          &copy; 2025 <span className="text-white font-bold">MERCAROF</span>. Conectando oportunidades en toda la región.
        </div>
        
        <div className="flex gap-6 uppercase tracking-widest font-bold">
          {['Términos', 'Privacidad', 'Soporte'].map(link => (
            <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
          ))}
        </div>

        <div className="flex gap-4">
          {['FB', 'IG', 'LI', 'X'].map(social => (
            <button key={social} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00B4D8] transition-colors">
              <span className="scale-75 font-black text-white">{social}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}