'use client';

import React from 'react';

interface LordIconProps {
  src: string;
  trigger?: 'hover' | 'loop' | 'click' | 'loop-on-hover' | 'morph';
  colors?: string;
  size?: number;
  className?: string;
}

export default function LordIcon({
  src,
  trigger = 'hover',
  colors = 'primary:#121331,secondary:#ff7b54',
  size = 40,
  className = '',
}: LordIconProps) {
  // @ts-ignore
  return (
    // @ts-ignore
    <lord-icon
      src={src}
      trigger={trigger}
      colors={colors}
      style={{ width: size, height: size }}
      class={className}
    >
    {/* @ts-ignore */}
    </lord-icon>
  );
}
