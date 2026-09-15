import React from 'react';
import { Quote } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Dr. Lucas Pellegrini',
      role: 'Cliente habitual • Sede Recoleta',
      comment:
        'Excelente atención. El oficio con las tijeras y la navaja es impecable. La puntualidad en el inicio del turno es estricta, algo difícil de hallar en la ciudad.',
    },
    {
      name: 'Mariano Benavídez',
      role: 'Cliente regular • Sede Palermo Soho',
      comment:
        'El ritual de la toalla caliente y el café mientras te atienden marca una diferencia real. La reserva digital es directa y sin fricciones.',
    },
    {
      name: 'Gonzalo Fernández',
      role: 'Cliente habitual • Sede Belgrano R',
      comment:
        'El servicio integral de corte y barba mantiene una prolijidad constante. El ambiente es tranquilo y los productos de primera línea.',
    },
  ];

  return (
    <section id="opiniones" className="bg-[#ECE7DE] text-[#141210] py-16 lg:py-24 border-t border-[#141210]/25 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 lg:mb-14">
          <div className="text-xs font-medium tracking-wider text-[#141210]/60 mb-3">
            N.º 06 — Testimonios
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141210] tracking-tight">
            La voz de nuestros clientes
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#141210]/70 max-w-lg">
            Apreciaciones de clientes que confían en nuestro criterio y puntualidad de atención.
          </p>
        </div>

        {/* Editorial Pull-Quotes Spread (7 cols featured pull-quote / 5 cols secondary reviews) */}
        {(() => {
          const featuredReview = reviews[0];
          const secondaryReviews = reviews.slice(1);

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Featured Main Pull Quote (7/12) */}
              {featuredReview && (
                <div className="lg:col-span-7 bg-[#DDD6C8]/40 border border-[#141210]/25 p-8 sm:p-10 rounded-[2px] flex flex-col justify-between">
                  <div>
                    <Quote className="w-8 h-8 text-[#141210]/30 mb-6 stroke-[1.5]" />
                    <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#141210] leading-snug italic">
                      "{featuredReview.comment}"
                    </blockquote>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#141210]/25 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#141210]">
                        {featuredReview.name}
                      </h4>
                      <p className="text-xs text-[#141210]/60 mt-0.5">{featuredReview.role}</p>
                    </div>
                    <span className="text-[10px] font-medium tracking-wider text-[#141210]/50 border border-[#141210]/25 px-2.5 py-1 rounded-[2px]">
                      Testimonio verificado
                    </span>
                  </div>
                </div>
              )}

              {/* Secondary Reviews Column (5/12) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                {secondaryReviews.map((rev, idx) => (
                  <div
                    key={idx}
                    className="p-6 sm:p-7 bg-[#DDD6C8]/30 border border-[#141210]/25 rounded-[2px] flex flex-col justify-between flex-1"
                  >
                    <div>
                      <Quote className="w-5 h-5 text-[#141210]/30 mb-3 stroke-[1.5]" />
                      <p className="font-serif text-sm sm:text-base text-[#141210] leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-[#141210]/25">
                      <h4 className="font-medium text-xs sm:text-sm text-[#141210]">{rev.name}</h4>
                      <p className="text-[11px] text-[#141210]/60 mt-0.5">{rev.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};

