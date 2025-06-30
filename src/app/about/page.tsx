'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { FaLaptop, FaCamera, FaUserTie } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto shadow-lg rounded-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl md:text-4xl font-bold">Sobre DigitalZone JC</CardTitle>
          <p className="text-muted-foreground text-sm">Innovación. Personalización. Tecnología al alcance de todos.</p>
        </CardHeader>

        <CardContent className="space-y-6 text-lg text-foreground/80">
          <div className="relative h-60 w-full rounded-lg overflow-hidden group">
            <Image
              src="https://jmtechnology.ec/cdn/shop/files/Portada_Jmt_1.webp?v=1717045534"
              alt="Interior de una tienda de tecnología moderna"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>

          <p>
            Bienvenido a <strong>DigitalZone JC</strong>, tu destino principal para las últimas tendencias en tecnología.
            Nos especializamos en ofrecer computadoras, laptops, periféricos, drones, cámaras y más, todo cuidadosamente seleccionado para ti.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
            <div className="flex flex-col items-center gap-1">
              <FaLaptop className="text-blue-600 text-2xl" />
              <span>Computadoras</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FaCamera className="text-purple-600 text-2xl" />
              <span>Drones</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FaCamera className="text-pink-600 text-2xl" />
              <span>Cámaras</span>
            </div>
          </div>

          <p>
            Nuestra misión es brindarte no solo productos innovadores, sino una experiencia de compra inteligente y personalizada.
            Con tecnologías modernas como <strong>Next.js</strong>, ofrecemos personalización de productos y recomendaciones inteligentes.
          </p>

          <p>
            Fundado por apasionados por la tecnología, DigitalZone JC se compromete con la calidad, la innovación y la satisfacción del cliente.
            Explora nuestra colección, personaliza tu equipo y vive el futuro de la tecnología.
          </p>

          {/* Equipo */}
          <div className="pt-2">
            <h3 className="text-xl font-semibold mb-3">Nuestro equipo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  <FaUserTie className="text-2xl text-primary" />
                </div>
                <div>
                  <p className="font-medium">Juan Carlos</p>
                  <p className="text-sm text-muted-foreground">Fundador & CEO</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  <MdEmail className="text-2xl text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Andrea Méndez</p>
                  <p className="text-sm text-muted-foreground">Atención al Cliente</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pt-6 border-t">
          <Link href="/products">
            <button className="px-6 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary/80 transition">
              Explora nuestros productos
            </button>
          </Link>
        </CardFooter>

        {/* Marcas asociadas */}

      {/* Marcas asociadas */}
<div className="pt-8">
  <h3 className="text-xl font-semibold text-center mb-6">Marcas asociadas</h3>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-center justify-center"
  >
    {[
      { name: 'Asus', file:'/logos/asus.svg' },
      { name: 'HP', file:'/logos/hp.svg' },
      { name: 'Sony', file:'/logos/sony_logo.svg' },
      { name: 'MSI', file:'/logos/msi.svg' },
      { name: 'Lenovo', file:'/logos/lenovo.svg' },
      { name: 'Canon', file:'/logos/canon.svg' },
      { name: 'Nikon', file:'/logos/nikon.svg' },
      { name: 'Logitech', file:'/logos/Logitech.svg' },
      { name: 'Dell', file:'/logos/Dell.png' },
      { name: 'Acer', file:'/logos/acer.svg' },
      { name: 'Razer', file:'/logos/razer.png' },
      { name: 'Samsung', file:'/logos/Samsung.png' },
      { name: 'Apple', file:'/logos/apple.png' },
    ].map((brand) => (
      <motion.div
        key={brand.name}
        whileHover={{ scale: 1.05 }}
        className="min-w-[100px] flex justify-center items-center"
      >
        <Image
          src={brand.file}
          alt={`${brand.name} logo`}
          width={100}
          height={40}
          className="object-contain grayscale hover:grayscale-0 transition duration-300 ease-in-out"
        />
      </motion.div>
    ))}
  </motion.div>
</div>


      </Card>
    </div>
  );
}
