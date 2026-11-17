// Falling snow for the Christmas Theme. Always rendered, shown only by CSS
// when data-theme="christmas" (see globals.css). Positions are derived from
// the index rather than Math.random() so server and client HTML match.
const FLAKES = 40;

export default function Snow() {
  return (
    <div aria-hidden className="snow">
      {Array.from({ length: FLAKES }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            fontSize: `${8 + ((i * 7) % 10)}px`,
            animationDuration: `${9 + ((i * 13) % 12)}s`,
            animationDelay: `-${(i * 17) % 20}s`,
            opacity: 0.4 + ((i * 3) % 6) / 10,
          }}
        >
          ❄
        </span>
      ))}
    </div>
  );
}
