
# SupplyShield Design System: "Minimal Light Ombre"

## 1. Design Philosophy
The "Minimal Light Ombre" design system establishes a high-assurance, uncluttered, and human-centric visual language for SupplyShield. Moving away from dark-mode neon tropes and synthetic glassmorphism, this design utilizes warm light tones, generous whitespace, crisp Inter typography, and a single muted rose accent.

All decoration is restrained and purposeful:
- No aurora blobs, background noise, or neon cyan glows.
- No glassmorphism (backdrop blur) or gradient text.
- No spotlight cursor glows, pulsing dots, or decorative counters on the landing page.
- Clear structural cards with a 1px border and very soft shadow.
- An interactive, procedurally extruded silver-white metallic 3D shield rendered with Three.js and React Three Fiber.

---

## 2. Color Palette & Tokens

| Token | Value | Semantic Role |
|---|---|---|
| `--bg-top` | `#FFFFFF` | Top gradient stop; pure clean white |
| `--bg-bottom` | `#FBE4EA` | Bottom gradient stop; soft warm pink tone |
| `--text-primary` | `#1E1A1C` | Primary content, headers, high-contrast labels |
| `--text-secondary` | `#6E6268` | Supporting body copy, metadata, subtitles |
| `--border-subtle` | `#F0DCE2` | 1px clean container and card borders |
| `--shadow-soft` | `0 1px 2px rgba(30, 26, 28, 0.04)` | Ultra-soft, minimal depth elevation |
| `--accent` | `#B8556B` | Single muted rose; primary button, links, focus rings |
| `--risk-low` | `#2F7D5B` | Low risk tier; muted forest assurance |
| `--risk-medium` | `#9A6410` | Medium risk tier; muted amber vigilance |
| `--risk-high` | `#A3213F` | High risk tier; muted crimson alert |

*Accessibility Rule*: All risk indicators strictly pair color with explicit text labels and semantic icons. Color is never the sole communication vector.

---

## 3. Typography Scale

Typography is optimized via `next/font/google` for zero layout shift:
- **All UI Text & Headings**: `Inter` (weights: 400, 500)
- **Code & Raw Evidence**: `JetBrains Mono` (weights: 400, 500)
- Space Grotesk is retired.

| Level | Font Family | Size / Line Height | Tracking | Weight |
|---|---|---|---|---|
| **Display / Hero H1** | Inter | 3.0rem / 3.5rem (48px) | -0.025em | 500 |
| **Section H2** | Inter | 2.0rem / 2.5rem (32px) | -0.02em | 500 |
| **H3 / Card Title** | Inter | 1.25rem / 1.75rem (20px) | -0.01em | 500 |
| **Body Regular** | Inter | 1.0rem / 1.6rem (16px) | 0 | 400 |
| **Small / Meta** | Inter | 0.875rem / 1.25rem (14px) | 0 | 400 / 500 |
| **Code Snippet** | JetBrains Mono | 0.8125rem / 1.25rem (13px) | 0 | 400 |

- Generous whitespace and a maximum content width of 1120px (`max-w-[1120px]`).

---

## 4. Spacing, Elevation & Radii

- **Base Corner Radius**: 12px (`rounded-[12px]`) on cards, containers, and buttons.
- **Pills & Badges**: 999px (`rounded-full`).
- **Elevation**: Flat surfaces with a 1px `#F0DCE2` border and `box-shadow: 0 1px 2px rgba(30, 26, 28, 0.04)`.

---

## 5. Procedural 3D Hero Shield

- Built procedurally in code using Three.js and React Three Fiber.
- Canvas is dynamically lazy-loaded (`ssr: false`) to safeguard initial paint performance.
- Extruded `THREE.Shape` with a flat top and sides curving to a bottom point (depth: 0.12, bevelSize: 0.04) plus an extruded inset outline rim.
- Material: `MeshPhysicalMaterial` (metalness: 1, roughness: 0.22, clearcoat: 1) with neutral/warm tint sitting naturally against `#FBE4EA`.
- Environment lighting via Three.js bundled `RoomEnvironment` and `PMREMGenerator` (strictly zero external CDN HDR requests, compliant with strict CSP `'self'`).
- Motion features:
  - Scroll-linked rotation around Y axis mapped from 0 to 1.25 turns, read in `useFrame` via scroll ref.
  - Pointer tilt up to 8 degrees with smooth damping.
  - Slow vertical float (0.05 units).
  - Capped `devicePixelRatio` at 2, rendering paused when off-screen via IntersectionObserver.
  - Accessible fallback: Static inline SVG silhouette shown on WebGL unavailability or `prefers-reduced-motion: reduce`.
