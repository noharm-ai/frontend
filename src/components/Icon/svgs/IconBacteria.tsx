/**
 * A bacterium: a rod-shaped cell lying on the diagonal, for the infection
 * control menu entry.
 *
 * Outlined, at about the stroke weight of the antd Outlined icons around it in
 * the menu, and as long and wide as the diagonal allows so it fills the box
 * like they do. Kept to the rod and two dots on purpose: pili and a flagellum
 * shrank it to a scribble at 14px, and the filled IconGerm reads as a blob.
 */
export function IconBacteria(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g transform="rotate(-45 12 12)">
        <rect
          x="0.9"
          y="6.6"
          width="22.2"
          height="10.8"
          rx="5.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="8.6" cy="12" r="1.5" fill="currentColor" />
        <circle cx="15.4" cy="12" r="1.5" fill="currentColor" />
      </g>
    </svg>
  );
}
