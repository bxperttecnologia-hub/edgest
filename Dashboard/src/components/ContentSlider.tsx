import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Edit3 } from "lucide-react";
import heroImage from "@/assets/hero-3d.png";

const slides = [
  {
    title: "Revolucionando a forma como aprendemos, ensinamos e compartilhamos conhecimento.",
    description: "Crie planos de aulas personalizados de forma inteligentes que se adaptam ao seu ritmo de ensino.",
    action: "Ensinando",
  },
  {
    title: "Transforme seus objetivos educacionais em conquistas reais e mensuráveis.",
    description: "Aproveite o poder desta ferramenta para acelerar seu desenvolvimento e alcançar seus objetivos acadêmicos da sua instituição.",
    action: "Evoluindo",
  },
  {
    title: "Experimente o futuro da educação com ferramentas inteligentes e interativas.",
    description: "Do básico ao avançado, construa sua reputação de forma eficiente e envolvente.",
    action: "Crescendo",
  },
];

export const ContentSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-full rounded-3xl bg-gradient-to-br from-[hsl(var(--slider-bg))] to-[hsl(var(--slider-bg-end))] p-12 flex flex-col justify-between overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={heroImage}
          alt="3D Geometric Shape"
          className="w-3/4 h-3/4 object-contain opacity-90 transition-transform duration-700 hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-3xl font-medium text-white leading-relaxed max-w-lg transition-all duration-500">
          {slides[currentSlide].title}
        </h2>
      </div>

      <div className="relative z-10 space-y-6">
        {/* Action Button */}
        <div className="flex items-center gap-4">
          <button className="px-6 py-2.5 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white flex items-center gap-2 hover:bg-white/20 transition-all">
            <Edit3 className="h-4 w-4" />
            {slides[currentSlide].action}
          </button>
          
          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="w-10 h-10 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/90 text-sm max-w-md leading-relaxed">
          {slides[currentSlide].description}
        </p>

        {/* Slide Indicators */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
 