import React from 'react';

interface PixelGridProps {
  width: number;
  height: number;
  selectedColor: string;
  pixels: string[][];
  onPixelClick: (x: number, y: number) => void;
}

export default function PixelGrid({ width, height, selectedColor, pixels, onPixelClick }: PixelGridProps) {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: `repeat(${width}, 20px)`,
      gap: '1px',
      backgroundColor: '#ddd',
      padding: '1px',
      width: 'fit-content',
      marginTop: '20px'
    }}>
      {Array.from({ length: height * width }).map((_, index) => {
        const x = index % width;
        const y = Math.floor(index / width);
        return (
          <div
            key={`${x}-${y}`}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: pixels[y][x],
              border: '1px solid #eee',
              cursor: 'pointer'
            }}
            onClick={() => onPixelClick(x, y)}
          />
        );
      })}
    </div>
  );
}
