import React from 'react';

export interface LimenAiIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

/**
 * LimenAiIcon: Icona ufficiale del brand LIMEN arricchita con micro-stelline AI.
 * Mantiene la 'L' bianca su sfondo slate (#0f172a) fedele all'asset originale (app-icon.svg),
 * accompagnata da raffinate micro-stelline in verde lime per denotare l'assistente intelligente.
 */
export const LimenAiIcon: React.FC<LimenAiIconProps> = ({
  size = 20,
  className,
  style,
  title = 'Limen AI',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label={title}
      role="img"
    >
      <title>{title}</title>

      {/* Riquadro ufficiale Limen: Slate scuro con angoli arrotondati rx=5.5 */}
      <rect x="1.5" y="3.5" width="20" height="20" rx="5.5" fill="#0f172a" />

      {/* L del logo ufficiale: Bianca, carattere pulito, perfettamente leggibile */}
      <text
        x="11.5"
        y="18"
        textAnchor="middle"
        fontFamily="Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="700"
        fontSize="12.5"
        fill="#ffffff"
        style={{ userSelect: 'none' }}
      >
        L
      </text>

      {/* Micro-stellina AI 1 (principale, tema chiaro #84cc16 / tema scuro #8d632d) */}
      <path
        d="M 21.5 1 C 21.5 3.2 21.5 3.2 23.8 3.5 C 21.5 3.8 21.5 3.8 21.5 6 C 21.5 3.8 21.5 3.8 19.2 3.5 C 21.5 3.2 21.5 3.2 21.5 1 Z"
        fill="var(--limen-ai-star-1, #84cc16)"
      />

      {/* Micro-stellina AI 2 (secondaria, tema chiaro #bef264 / tema scuro #b8863f) */}
      <path
        d="M 24.5 7.5 C 24.5 8.8 24.5 8.8 25.8 9 C 24.5 9.2 24.5 9.2 24.5 10.5 C 24.5 9.2 24.5 9.2 23.2 9 C 24.5 8.8 24.5 8.8 24.5 7.5 Z"
        fill="var(--limen-ai-star-2, #bef264)"
      />
    </svg>
  );
};

export default LimenAiIcon;
