import { useId } from "react";
import { regions, type RegionId } from "../../lib/bodyAnalysis";
import { t } from "../../lib/i18n";

// Schematic anatomy, not a reconstruction of the user's body. Mirrored paths
// are visual only: measurements retain their recorded left/right labels.
const front: Partial<Record<RegionId, string[]>> = {
  neck: ["M148 73 L147 91 L160 103 L173 91 L172 73 Z"],
  shoulders: ["M131 96 Q107 94 99 118 L96 140 Q108 147 119 129 L130 111 Z"],
  chest: ["M134 102 L157 110 L157 151 Q137 165 119 145 L122 120 Z"],
  arms: ["M98 145 Q107 151 116 142 L112 180 Q108 203 95 210 L86 203 L91 169 Z"],
  forearms: ["M86 213 L99 218 L85 255 L75 282 L65 278 L70 248 Z"],
  core: ["M126 161 L157 169 L157 246 L144 260 L124 225 L117 181 Z"],
  thighs: [
    "M119 279 Q133 270 153 289 L149 365 Q149 392 135 408 L119 404 L108 359 Z",
  ],
  calves: ["M119 425 L135 425 Q148 451 135 481 L129 513 L118 513 L114 480 Z"],
};
const back: Partial<Record<RegionId, string[]>> = {
  neck: front.neck,
  shoulders: front.shoulders,
  back: [
    "M131 101 L157 105 L157 166 L135 183 L123 153 Z",
    "M121 160 L154 183 L157 244 L138 246 L120 204 Z",
  ],
  arms: front.arms,
  forearms: front.forearms,
  glutes: ["M124 250 L157 251 L157 293 Q139 311 116 292 Z"],
  thighs: ["M117 306 Q135 318 154 303 L148 375 L137 410 L122 409 L110 359 Z"],
  calves: front.calves,
};
export default function BodyMap({
  view,
  selected,
  onSelect,
  priorities,
  recorded,
}: {
  view: "front" | "back";
  selected: RegionId;
  onSelect: (id: RegionId) => void;
  priorities: RegionId[];
  recorded: RegionId[];
}) {
  const gradient = useId();
  const parts = view === "front" ? front : back;
  return (
    <svg
      className="body-map"
      viewBox="0 0 320 560"
      aria-label={t("Mapa muscular interactivo")}
    >
      <defs>
        <linearGradient id={gradient} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="var(--blue-soft)" />
          <stop offset="1" stopColor="var(--panel)" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="542" rx="67" ry="7" className="body-shadow" />
      <g className="body-figure" key={view}>
        <g className="body-outline" fill={`url(#${gradient})`}>
          <path d="M139 30 Q160 13 181 30 L183 56 Q181 76 160 82 Q139 76 137 56 Z" />
          <path d="M147 77 L145 93 Q110 85 99 111 Q90 126 88 153 L78 197 L66 235 L57 276 L52 291 L53 309 Q58 317 63 309 L68 293 L80 280 L98 238 L112 204 L121 228 L116 266 Q101 310 105 351 L114 409 L111 441 L115 487 L115 515 L104 530 Q101 540 114 541 L134 536 L139 520 L141 483 L151 439 L148 413 L158 322 L162 322 L172 413 L169 439 L179 483 L181 520 L186 536 L206 541 Q219 540 216 530 L205 515 L205 487 L209 441 L206 409 L215 351 Q219 310 204 266 L199 228 L208 204 L222 238 L240 280 L252 293 L257 309 Q262 317 267 309 L268 291 L263 276 L254 235 L242 197 L232 153 Q230 126 221 111 Q210 85 175 93 L173 77" />
        </g>
        {regions
          .filter((r) => parts[r.id])
          .map((r) => (
            <g
              key={r.id}
              role="button"
              tabIndex={0}
              aria-label={t(r.label)}
              aria-pressed={selected === r.id}
              className={`body-muscle ${recorded.includes(r.id) ? "has-data" : ""} ${priorities.includes(r.id) ? "is-priority" : ""} ${selected === r.id ? "is-selected" : ""}`}
              onClick={() => onSelect(r.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(r.id);
                }
              }}
            >
              <title>{t(r.label)}</title>
              {parts[r.id]!.map((d, i) => (
                <g key={i}>
                  <path d={d} />
                  {r.id !== "neck" && (
                    <path d={d} transform="translate(320 0) scale(-1 1)" />
                  )}
                </g>
              ))}
            </g>
          ))}
        <g className="body-fibres" aria-hidden="true">
          {view === "front" ? (
            <>
              <path d="M132 120 L150 125 M130 130 L150 134 M131 140 L150 142 M188 120 L170 125 M190 130 L170 134 M189 140 L170 142 M137 182 H153 M137 198 H153 M140 215 H153 M183 182 H167 M183 198 H167 M180 215 H167" />
              <path d="M128 308 L130 371 M144 312 L139 373 M192 308 L190 371 M176 312 L181 373" />
            </>
          ) : (
            <path d="M136 115 L150 145 M184 115 L170 145 M126 176 L148 194 M194 176 L172 194 M124 319 L131 383 M196 319 L189 383" />
          )}
          <path d="M99 164 L98 188 M221 164 L222 188 M82 236 L73 265 M238 236 L247 265 M124 442 L126 477 M196 442 L194 477" />
        </g>
      </g>
    </svg>
  );
}
