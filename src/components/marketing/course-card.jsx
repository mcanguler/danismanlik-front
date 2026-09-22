import Image from "next/image";
import { SectionHeading } from "@/components/marketing/section-heading";

export function CourseCard({ course }) {
  return (
    <div className="group flex flex-col rounded-3xl bg-canvas-pure overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300">
      <div className="relative h-60 w-full overflow-hidden bg-surface-container">
        <Image
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          src={course.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="px-3.5 py-1.5 rounded-full bg-accent-gold text-primary font-label-sm text-label-sm font-bold shadow-md">
            {course.discount}
          </span>
        </div>
      </div>
      <div className="p-7 flex flex-col flex-grow justify-between">
        <h3 className="font-title-lg text-title-lg text-primary font-semibold mb-6 leading-snug">
          {course.title}
        </h3>
        <div className="pt-6 border-t border-surface-container flex items-center justify-between">
          <div>
            <span className="block font-body-sm text-body-sm line-through text-outline">
              {course.oldPrice}
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-primary">
              {course.price}
            </span>
          </div>
          <button
            className="px-6 py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-md hover:bg-burgundy-light transition-all"
            type="button"
          >
            Eğitime Katıl
          </button>
        </div>
      </div>
    </div>
  );
}