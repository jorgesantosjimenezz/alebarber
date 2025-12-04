import Link from 'next/link';
import { Scissors, Clock, Calendar, CheckCircle, Sparkles, Star, CalendarCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - With Background Image */}
      <section className="relative py-32 overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/barber-background.jpg)',
          }}
        >
          {/* Dark overlay para que el texto sea legible */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            {/* Titulo con tijeras a los lados */}
            <div className="flex items-center justify-center gap-6 md:gap-12 mb-6">
              <Scissors className="w-8 h-8 md:w-16 md:h-16 text-amber-600 animate-bounce drop-shadow-2xl" />
              <h1 className="text-3xl md:text-6xl font-bold text-white drop-shadow-2xl">
                ¡Bienvenido a AleBarber!
              </h1>
              <Scissors className="w-8 h-8 md:w-16 md:h-16 text-amber-600 animate-bounce drop-shadow-2xl" style={{ animationDelay: '0.3s' }} />
            </div>
            <p className="text-xl md:text-3xl mb-6 text-gray-100 max-w-3xl mx-auto drop-shadow-lg">
              Tu barbero lituano de confianza
            </p>

            {/* Ubicación */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex items-center gap-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-xl border-2 border-amber-600">
                <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  Slucko g.8, Vilnius
                </span>
              </div>
            </div>
            <Link
              href="/reservar"
              className="inline-flex items-center gap-3 gradient-secondary text-[#1a1a1a] px-10 py-5 rounded-xl text-lg font-bold hover:scale-105 transition-all shadow-2xl button-primary gradient-shine"
            >
              <CalendarCheck className="w-6 h-6" />
              Reserva tu cita aquí
              <CalendarCheck className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section - Enhanced cards */}
      <section className="py-20 bg-white dark:bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-4 text-[#8b4513] animate-fade-in">
            Nuestros Servicios
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg animate-fade-in">
            Experiencia premium en cada visita
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Scissors,
                title: 'Corte Especializado',
                description: 'Cortes perfectamente adaptados a tu estilo personal',
                delay: '0s'
              },
              {
                icon: Clock,
                title: 'Rápido y Eficiente',
                description: 'Sesiones de 45 minutos para tu comodidad',
                delay: '0.2s'
              },
              {
                icon: Calendar,
                title: 'Reserva Online',
                description: 'Sistema de reservas fácil y conveniente 24/7',
                delay: '0.4s'
              }
            ].map((service, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-[#222] dark:to-[#1a1a1a] shadow-lg hover-lift card-hover border border-gray-100 dark:border-gray-800 animate-scale-in"
                style={{ animationDelay: service.delay }}
              >
                <div className="inline-block p-4 bg-gradient-to-br from-[#8b4513] to-[#6d3610] rounded-2xl mb-6 shadow-lg">
                  <service.icon className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#8b4513]">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Hours - Enhanced design */}
      <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-[#0f0f0f] dark:to-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-4 text-[#8b4513]">
            Horario de apertura
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
            Nuestra disponibilidad para dejarte como nuevo
          </p>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl p-10 hover-glow">
              <div className="space-y-5">
                {[
                  { day: 'Lunes', hours: '12:00 - 16:00', open: true },
                  { day: 'Martes', hours: 'Cerrado', open: false },
                  { day: 'Miércoles', hours: '12:00 - 16:00', open: true },
                  { day: 'Jueves', hours: 'Cerrado', open: false },
                  { day: 'Viernes', hours: '12:00 - 16:00', open: true },
                  { day: 'Sábado', hours: '13:00 - 16:00', open: true },
                  { day: 'Domingo', hours: '13:00 - 16:00', open: true },
                ].map((schedule, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 rounded-xl transition-all duration-300 ${schedule.open
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 hover:scale-[1.02]'
                      : 'bg-gray-50 dark:bg-[#222] opacity-60'
                      }`}
                  >
                    <span className="font-bold text-lg flex items-center gap-3">
                      {schedule.open && <Star className="w-5 h-5 text-green-600 fill-green-600" />}
                      {schedule.day}
                    </span>
                    <span className={`font-semibold text-lg ${schedule.open
                      ? 'text-[#8b4513] dark:text-[#daa520]'
                      : 'text-red-600 dark:text-red-400'
                      }`}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white dark:bg-[#1a1a1a]">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-4 text-[#8b4513]">
            ¿Por Qué Elegirnos?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg">
            Calidad y profesionalismo garantizados
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              'Barberos profesionales con ganas de seguir mejorando',
              'Ambiente acogedor y moderno',
              'Productos de alta calidad',
              'Sistema de reservas sin complicaciones',
              'Horarios flexibles',
              'Excelente relación calidad-precio',
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover-lift animate-slide-in-right"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-lg font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="py-24 gradient-primary text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <Scissors className="w-16 h-16 mx-auto mb-6 text-[#daa520] animate-bounce" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            ¿Listo para tu nuevo corte?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto animate-fade-in">
            Reserva tu cita ahora y experimenta el mejor servicio de nuestra barbería
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-3 gradient-secondary text-[#1a1a1a] px-10 py-5 rounded-xl text-lg font-bold hover:scale-105 transition-all shadow-2xl button-primary gradient-shine animate-scale-in"
          >
            <CalendarCheck className="w-6 h-6" />
            Comenzar Ahora
            <CalendarCheck className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </main>
  );
}
