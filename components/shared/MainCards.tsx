import React from 'react';
import Image from 'next/image';

interface ReusableCardProps {
  imageSrc: string;
  imageAlt: string;
  imageBgColor?: string; // Can be a Tailwind class (e.g., "bg-blue-100") or a custom hex color (e.g., "#6000DA12")
  primaryText: string;
  secondaryText: string;
}

const ReusableCard: React.FC<ReusableCardProps> = ({
  imageSrc,
  imageAlt,
  imageBgColor = "bg-[#6000DA12]",
  primaryText,
  secondaryText,
}) => {
  // Determine if the provided imageBgColor is a custom color code
  const isCustomColor = imageBgColor.startsWith("#");

  return (
    <div className="bg-white rounded-lg md:w-1/4 shadow-md border flex items-center gap-3 p-3 border-gray-200 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 hover:scale-101">
      <div
        className={`p-2 rounded-lg ${!isCustomColor ? imageBgColor : ""}`}
        style={isCustomColor ? { backgroundColor: imageBgColor } : undefined}
      >
        <Image src={imageSrc} alt={imageAlt} width={20} height={20} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-barlow text-sm font-semibold">{primaryText}</span>
        <span className="font-barlow text-sm">{secondaryText}</span>
      </div>
    </div>
  );
};

export default ReusableCard;
