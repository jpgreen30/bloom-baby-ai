export const BloomingFlowerLoader = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <svg 
        width="60" 
        height="60" 
        viewBox="0 0 100 100" 
        className="animate-bloom"
      >
        {/* 5 petals in circular pattern */}
        {[0, 72, 144, 216, 288].map((rotation, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="25"
            rx="12"
            ry="18"
            fill="hsl(var(--accent))"
            opacity="0.7"
            transform={`rotate(${rotation} 50 50)`}
            style={{
              animation: `petal-bloom 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
        {/* Center circle */}
        <circle cx="50" cy="50" r="8" fill="hsl(var(--primary-glow))" />
      </svg>
    </div>
  );
};
