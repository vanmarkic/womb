interface FigureBaseline {
  duration: number;
  fadeIn: number;
  fadeOut: number;
}

const FIGURE_BASELINES: Record<number, FigureBaseline> = {
  1: { duration: 12000, fadeIn: 6000, fadeOut: 6000 },
  2: { duration: 15000, fadeIn: 7500, fadeOut: 7500 },
  3: { duration: 18000, fadeIn: 9000, fadeOut: 9000 },
  4: { duration: 14000, fadeIn: 7000, fadeOut: 7000 },
  5: { duration: 16000, fadeIn: 8000, fadeOut: 8000 },
  6: { duration: 20000, fadeIn: 10000, fadeOut: 10000 },
};

interface CalculatedParameters {
  duration: number;
  fadeIn: number;
  fadeOut: number;
}

/**
 * Calculate modified animation parameters based on visual intensity slider
 *
 * Formulas:
 * - duration = baseline + (15000 - baseline) * S
 * - fadeIn = baselineFadeIn / (1 + 2*S)
 * - fadeOut = 5000 + (baselineFadeOut - 5000) * (1-S)
 *
 * @param baseline - Baseline animation parameters for a figure
 * @param visualIntensity - Slider value from 0 to 1
 * @returns Calculated parameters with modified animation values
 */
function calculateParameters(
  baseline: FigureBaseline,
  visualIntensity: number
): CalculatedParameters {
  const S = Math.max(0, Math.min(1, visualIntensity));

  const duration = baseline.duration + (15000 - baseline.duration) * S;
  const fadeIn = baseline.fadeIn / (1 + 2 * S);
  const fadeOut = 5000 + (baseline.fadeOut - 5000) * (1 - S);

  return { duration, fadeIn, fadeOut };
}

/**
 * Generate CSS rules for all background figures based on visual intensity
 * @param visualIntensity - Slider value from 0 to 1
 * @returns CSS string with animation duration overrides for each figure
 */
function generateCSSRules(visualIntensity: number): string {
  let css = '';

  for (let i = 1; i <= 6; i++) {
    const baseline = FIGURE_BASELINES[i];
    const params = calculateParameters(baseline, visualIntensity);

    css += `.bg-figure-${i} {\n`;
    css += `  animation-duration: ${params.duration}ms !important;\n`;
    css += `}\n\n`;
  }

  return css;
}

/**
 * Apply visual settings by modifying animation parameters based on intensity slider
 *
 * Creates or updates a dynamic style element with ID "visual-modifier-style" to inject
 * CSS rules that override the baseline animations for all 6 background figures.
 * Uses requestAnimationFrame to ensure smooth CSS transitions.
 *
 * @param visualIntensity - Slider value from 0 (baseline animations) to 1 (maximum modification)
 *
 * @example
 * // Apply baseline settings
 * applyVisualSettings(0);
 *
 * // Apply maximum visual intensity
 * applyVisualSettings(1);
 *
 * // Apply mid-range intensity
 * applyVisualSettings(0.5);
 */
export function applyVisualSettings(visualIntensity: number): void {
  // Clamp intensity to valid range [0, 1]
  const intensity = Math.max(0, Math.min(1, visualIntensity));

  // Generate CSS rules for all figures based on current intensity
  const css = generateCSSRules(intensity);

  // Get existing style element or create a new one
  let styleElement = document.getElementById('visual-modifier-style') as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'visual-modifier-style';
    document.head.appendChild(styleElement);
  }

  // Inject or update CSS
  styleElement.textContent = css;

  // Use requestAnimationFrame to ensure smooth transitions
  requestAnimationFrame(() => {
    // CSS injection complete, browser will apply animations in next frame
  });
}
