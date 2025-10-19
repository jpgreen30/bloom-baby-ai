const FeaturedIn = () => {
  const publications = [
    "TechCrunch",
    "BabyCenter",
    "Parents Magazine",
    "Motherly",
    "The Bump",
  ];

  return (
    <div className="text-center space-y-6">
      <p className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
        As Featured In
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {publications.map((pub, index) => (
          <div
            key={index}
            className="text-lg md:text-xl font-semibold text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            {pub}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedIn;
