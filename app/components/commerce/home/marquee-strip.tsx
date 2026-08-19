/** Slow typographic marquee — truthful words only, stands still on reduced motion. */
function MarqueeStrip() {
  const items = [
    "Collections",
    "Full catalog",
    "Open source",
    "Inertia + SFRA",
    "Meridian",
  ];
  const row = (hidden: boolean) => (
    <div
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center"
    >
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="display-caps px-8 text-2xl md:text-3xl">{item}</span>
          <span className="size-2 bg-foreground" aria-hidden />
        </span>
      ))}
    </div>
  );

  return (
    <div className="group overflow-hidden border-y py-5">
      <div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export { MarqueeStrip };
