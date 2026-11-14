"use client";

import { useId, useRef } from "react";
import { useInView } from "framer-motion";
import type { ServiceMotifId } from "@/data/services";
import styles from "./ServiceCardIllustration.module.css";

function Rupee({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M-12-17H14M-12-7H14M-7-17C14-17 14 5-9 5L13 23" />;
}

/** Card-only artwork: the detail-page hero scenes remain independent. */
export default function ServiceCardIllustration({ motif }: { motif: ServiceMotifId }) {
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { amount: 0.15 });
  const gold = `url(#${id}-gold)`;
  const surface = `url(#${id}-surface)`;
  const wash = `url(#${id}-wash)`;

  return (
    <span ref={ref} className={styles.scene} data-visible={visible} aria-hidden="true">
      <svg viewBox="60 0 480 300" fill="none" focusable="false" className={styles.art}>
        <defs>
          <linearGradient id={`${id}-gold`} x1="140" y1="50" x2="420" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-gold-300)" />
            <stop offset="0.48" stopColor="var(--color-gold-500)" />
            <stop offset="1" stopColor="var(--color-gold-300)" />
          </linearGradient>
          <linearGradient id={`${id}-surface`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--color-ink-700)" />
            <stop offset="1" stopColor="var(--color-ink-900)" />
          </linearGradient>
          <linearGradient id={`${id}-wash`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="var(--color-gold-400)" stopOpacity="0.2" />
            <stop offset="1" stopColor="var(--color-gold-400)" stopOpacity="0.025" />
          </linearGradient>
          <radialGradient id={`${id}-halo`}>
            <stop stopColor="var(--color-gold-400)" stopOpacity="0.09" />
            <stop offset="1" stopColor="var(--color-gold-400)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="300" cy="150" rx="255" ry="145" fill={`url(#${id}-halo)`} />
        <g className={styles.guides} strokeWidth="0.7">
          <circle cx="300" cy="150" r="117" />
          <circle cx="300" cy="150" r="135" strokeDasharray="2 9" />
          <path d="M55 242H545M300 15V35M300 265V285M65 150H85M515 150H535" />
          <path d="M106 67V53H120M480 53H494V67M106 233V247H120M480 247H494V233" />
        </g>

        <g strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {motif === "demat" && <>
            <rect x="142" y="65" width="289" height="179" rx="12" fill={surface} className={styles.outline} />
            <rect x="132" y="55" width="289" height="179" rx="12" fill={surface} className={styles.outline} />
            <path d="M133 91H420" className={styles.outline} />
            <g fill="var(--color-gold-400)" stroke="none" opacity="0.65">
              <circle cx="151" cy="73" r="2" /><circle cx="161" cy="73" r="2" /><circle cx="171" cy="73" r="2" />
            </g>
            <path d="M153 211H389M153 175H389M153 139H389" className={styles.guides} />
            <g fill={wash} stroke={gold}>
              <rect x="166" y="171" width="25" height="40" rx="3" />
              <rect x="209" y="147" width="25" height="64" rx="3" />
              <rect x="252" y="158" width="25" height="53" rx="3" />
              <rect x="295" y="119" width="25" height="92" rx="3" />
            </g>
            <path d="M160 151L213 122L255 137L311 103L359 117" stroke={gold} />
            <path className={styles.flow} d="M160 151L213 122L255 137L311 103L359 117" pathLength="100" />
            <circle cx="406" cy="195" r="47" fill={surface} className={styles.outline} />
            <circle cx="406" cy="195" r="38" fill={wash} stroke={gold} />
            <g stroke={gold}><Rupee x={406} y={192} scale={0.85} /></g>
          </>}

          {motif === "mutual" && <>
            {[{ x: 201, y: 199, layers: 3 }, { x: 300, y: 177, layers: 5 }, { x: 399, y: 207, layers: 2 }].map(({ x, y, layers }) => (
              <g key={x}>
                <path d={`M${x - 42} ${y}V${y + layers * 9}C${x - 42} ${y + layers * 9 + 20} ${x + 42} ${y + layers * 9 + 20} ${x + 42} ${y + layers * 9}V${y}`} fill={surface} className={styles.outline} />
                {Array.from({ length: layers }, (_, i) => <path key={i} d={`M${x - 42} ${y + i * 9 + 8}C${x - 42} ${y + i * 9 + 28} ${x + 42} ${y + i * 9 + 28} ${x + 42} ${y + i * 9 + 8}`} className={styles.outline} />)}
                <ellipse cx={x} cy={y} rx="42" ry="15" fill={wash} stroke={gold} />
                <ellipse cx={x} cy={y} rx="32" ry="10" stroke={gold} opacity="0.3" />
              </g>
            ))}
            <g className={styles.sprout} stroke={gold}>
              <path d="M300 175C300 140 307 118 300 88" />
              <path d="M302 136C263 140 244 113 244 89C277 90 301 105 302 136Z" fill={wash} />
              <path d="M303 111C302 80 327 58 357 57C356 86 338 111 303 111Z" fill={wash} />
              <path d="M302 135L259 103M305 108L341 73" opacity="0.65" />
            </g>
            <g stroke={gold}><Rupee x={201} y={197} scale={0.34} /><Rupee x={399} y={205} scale={0.34} /></g>
          </>}

          {motif === "insurance" && <>
            <path d="M183 137C193 69 242 43 300 43S407 69 417 137C392 120 368 120 347 137C317 120 284 120 254 137C232 120 207 120 183 137Z" fill={surface} className={styles.outline} />
            <g stroke={gold}>
              <path d="M183 137C193 69 242 43 300 43S407 69 417 137C392 120 368 120 347 137C317 120 284 120 254 137C232 120 207 120 183 137Z" fill={wash} />
              <path d="M254 137C254 92 274 62 300 43C326 62 347 92 347 137M300 36V42" />
            </g>
            <path className={styles.flow} d="M183 137C193 69 242 43 300 43S407 69 417 137" pathLength="100" />
            <path d="M300 44V183C300 200 287 201 281 192" stroke={gold} opacity="0.55" />
            <g fill={surface} className={styles.outline}>
              <circle cx="253" cy="162" r="19" /><path d="M219 238V217C219 190 233 185 253 185S287 190 287 217V238Z" />
              <circle cx="348" cy="160" r="21" /><path d="M312 238V214C312 188 327 185 348 185S384 188 384 214V238Z" />
            </g>
            <g stroke={gold} fill={surface}>
              <circle cx="300" cy="192" r="15" /><path d="M276 239V228C276 211 286 208 300 208S324 211 324 228V239Z" />
            </g>
            <path d="M202 242H400" stroke={gold} opacity="0.35" />
          </>}

          {motif === "physical" && <>
            <rect x="146" y="67" width="131" height="179" rx="5" fill={surface} className={styles.outline} />
            <rect x="136" y="57" width="131" height="179" rx="5" fill={surface} className={styles.outline} />
            <path d="M148 87V69H166M237 69H255V87M148 206V224H166M237 224H255V206" stroke={gold} opacity="0.65" />
            <path d="M166 99H238M166 111H222M160 139H243M160 151H243M160 163H225" className={styles.outline} />
            <circle cx="201" cy="197" r="16" fill={wash} stroke={gold} /><circle cx="201" cy="197" r="10" stroke={gold} opacity="0.4" />
            <path d="M280 148H320M313 142L320 148L313 154" stroke={gold} />
            <rect x="333" y="57" width="131" height="179" rx="10" fill={surface} className={styles.outline} />
            <rect x="343" y="69" width="111" height="143" rx="4" fill={wash} stroke={gold} strokeOpacity="0.5" />
            {Array.from({ length: 20 }, (_, i) => <rect key={i} x={356 + i % 4 * 24} y={85 + Math.floor(i / 4) * 24} width="13" height="13" rx="2" fill="var(--color-gold-400)" opacity={[0.2, 0.45, 0.15, 0.6][i % 4]} />)}
            <path className={styles.scan} d="M153 121H250" stroke={gold} strokeWidth="2.5" />
            <path d="M389 224H408" stroke={gold} />
          </>}

          {motif === "iepf" && <>
            <path d="M267 91L251 51C268 42 280 62 298 51C316 40 329 55 348 49L332 91" fill={surface} className={styles.outline} />
            <path d="M267 91C251 111 214 142 211 190C207 232 245 249 300 249C355 249 393 232 389 190C386 142 349 111 332 91Z" fill={surface} className={styles.outline} />
            <path d="M274 106C257 128 245 155 242 179M325 107C341 122 352 143 357 161" className={styles.outline} opacity="0.5" />
            <path d="M265 91H335M269 97H331M292 100L282 123M306 100L319 121" stroke={gold} />
            <circle cx="300" cy="183" r="43" fill={wash} stroke={gold} />
            <circle cx="300" cy="183" r="35" stroke={gold} opacity="0.35" />
            <circle className={styles.coinLight} cx="300" cy="183" r="43" pathLength="100" />
            <g stroke={gold}><Rupee x={300} y={180} scale={0.9} /></g>
            <g stroke={gold} opacity="0.65">
              <path d="M184 210V132L173 143M184 132L195 143M416 210V132L405 143M416 132L427 143" />
              <circle cx="184" cy="220" r="2" /><circle cx="416" cy="220" r="2" />
            </g>
          </>}
        </g>
      </svg>
    </span>
  );
}
