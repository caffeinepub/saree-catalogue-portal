import { Package, Users } from 'lucide-react';

export default function FeatureSection() {
  const features = [
    {
      icon: <img src="./assets/generated/catalog-icon.dim_64x64.png" alt="Catalog" className="w-12 h-12" />,
      title: 'Catalog Management',
      description: 'Upload and organize your saree collection with beautiful images and detailed descriptions.',
    },
    {
      icon: <img src="./assets/generated/customers-icon.dim_64x64.png" alt="Customers" className="w-12 h-12" />,
      title: 'Customer Portal',
      description: 'Manage your retail, wholesale, and direct customers all in one place.',
    },
    {
      icon: <Package className="w-12 h-12 text-[#E07A5F]" />,
      title: 'Smart Sharing',
      description: 'Generate unique links for each customer type to share your catalog effortlessly.',
    },
    {
      icon: <Users className="w-12 h-12 text-[#C1403D]" />,
      title: 'Mobile Friendly',
      description: 'Access your portal from any device, anywhere, anytime.',
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-foreground mb-4">
          Everything You Need
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Powerful tools designed specifically for Indian weavers to showcase their craftsmanship
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-serif font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
