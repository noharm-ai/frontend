/**
 * A germ: round body with radiating spikes, for the culture alerts.
 *
 * Drawn heavy and with few spikes on purpose. It is rendered at 15-18px, and
 * the first attempts — thin strokes, eight spikes, knobbed tips — read as a
 * starburst at that size because the spikes outweigh the body. The body is one
 * path with two counter-wound circles inside it, so the evenodd rule cuts them
 * out as real holes and the icon reads the same on the white cell of the
 * alerts card and on the red one.
 */
export function IconGerm(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        <path d="M18.6 12h3" />
        <path d="M15.3 17.7l1.5 2.6" />
        <path d="M8.7 17.7l-1.5 2.6" />
        <path d="M5.4 12h-3" />
        <path d="M8.7 6.3L7.2 3.7" />
        <path d="M15.3 6.3l1.5-2.6" />
      </g>
      <path
        fillRule="evenodd"
        d="M5 12a7 7 0 1 0 14 0 7 7 0 1 0-14 0Z
           M8.1 10.2a1.7 1.7 0 1 0 3.4 0 1.7 1.7 0 1 0-3.4 0Z
           M12.3 13.4a1.4 1.4 0 1 0 2.8 0 1.4 1.4 0 1 0-2.8 0Z"
      />
    </svg>
  );
}
