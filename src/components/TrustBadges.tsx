import { ShieldCheck, Truck, CreditCard, Award } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      name: 'Más de 60 años de experiencia',
      description: 'Tradición y solidez en el mercado mexicano.',
      icon: Award,
    },
    {
      name: 'Garantía directa',
      description: 'Respaldo total en todos nuestros productos.',
      icon: ShieldCheck,
    },
    {
      name: 'Trato directo y logística propia',
      description: 'Entregas seguras con nuestra flotilla en CDMX.',
      icon: Truck,
    },
    {
      name: 'Pagos 100% Seguros',
      description: 'Transacciones protegidas y meses sin intereses.',
      icon: CreditCard,
    },
  ];

  return (
    <div className="bg-white py-12 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
          {badges.map((badge) => (
            <div key={badge.name} className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-pink-50 text-mosqueta-primary mb-4">
                <badge.icon className="h-8 w-8" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-montserrat">{badge.name}</h3>
              <p className="mt-2 text-sm text-gray-500 font-inter">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
