import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const reviews = [
    {
      name: 'Dr. Lucas Pellegrini',
      role: 'Cliente frecuente • Sede Recoleta',
      stars: 5,
      comment:
        'Excelente atención. Joaquín es un maestro con la barba y las tijeras. La puntualidad en los turnos es sagrada, algo muy difícil de encontrar hoy en día.',
    },
    {
      name: 'Mariano Benavídez',
      role: 'Cliente regular • Sede Palermo Soho',
      stars: 5,
      comment:
        'El ritual de la toalla caliente y el café mientras te atienden es 10/10. La reserva por WhatsApp y la app funcionan de manera instantánea y súper intuitiva.',
    },
    {
      name: 'Gonzalo Fernández',
      role: 'Cliente frecuente • Sede Belgrano R',
      stars: 5,
      comment:
        'El combo corte + barba con Enzo en Palermo y Lucas en Belgrano es extraordinario. Muy prolijos, ambiente relajado y productos de primer nivel.',
    },
  ];

  return (
    <section id="opiniones" className="py-20 bg-zinc-950 border-b border-zinc-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Reseñas de Clientes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Confianza respaldada por resultados
          </h2>
          <p className="mt-3 text-zinc-400 text-sm">
            Más de 4.9 estrellas en Google con cientos de testimonios comprobables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex flex-col justify-between relative shadow-lg"
            >
              <Quote className="w-8 h-8 text-zinc-800 absolute top-4 right-4" />
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-zinc-100">{rev.name}</h4>
                  <p className="text-[11px] text-zinc-400">{rev.role}</p>
                </div>
                <span title="Verificado">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
