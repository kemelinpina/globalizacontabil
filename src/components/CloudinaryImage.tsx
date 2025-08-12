import React from 'react';
import Image from 'next/image';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  quality?: number;
}

export default function CloudinaryImage({
  src,
  alt,
  width = 800,
  height = 400,
  className,
  style,
  priority = false,
  quality = 75
}: CloudinaryImageProps) {
  // Verificar se a URL é do Cloudinary
  const isCloudinaryUrl = src.includes('cloudinary.com');
  
  if (!isCloudinaryUrl) {
    // Se não for Cloudinary, usar imagem normal
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
      />
    );
  }

  // Para imagens do Cloudinary, usar o componente Next.js Image
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      priority={priority}
      quality={quality}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
