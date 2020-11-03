import { pseudovoigtFct } from './shapes/pseudovoigtFct';
/**
 * Calculate a linear combination of gaussian and lorentzian function width an same full width at half maximum
 * @param {object} [options = {}]
 * @param {Number} [options.height = 1] - maximum value of the curve.
 * @param {Number} [options.normalized = false] - If it's true the area under the curve will be equal to one, ignoring height option.
 * @param {number} [options.fwhm = 1000] - number of points in Full Width at Half Maximum, Standard deviation for gaussian contribution will be computed as fwhm / 2 / sqrt(2 ln(2))
 * @param {number} [options.mu = 0.5] - fraction of lorentzian contribution.
 * @param {number} [options.factor = Math.tan(Math.PI * (0.9999 - 0.5))] - Number of time to take fwhm to calculate length. Default covers 99.99 % of area.
 * @param {number} [options.length = fwhm * factor + 1] - total number of points to calculate
 * @return {object} - {fwhm, data<Float64Array>}
 */

export function pseudoVoigt(options = {}) {
  let {
    height = 1,
    normalized = false,
    length,
    factor = Math.ceil(2 * Math.tan(Math.PI * (0.9999 - 0.5))),
    fwhm = 1000,
    mu = 0.5,
  } = options;

  if (!length) {
    length = Math.ceil(fwhm * factor);
    if (length % 2 === 0) length++;
  }

  const center = (length - 1) / 2;

  const func = pseudovoigtFct({
    x: center,
    width: fwhm,
    y: height,
    mu,
    normalized,
  });

  const data = new Float64Array(length);
  for (let i = 0; i <= center; i++) {
    data[i] = func(i);
    data[length - 1 - i] = data[i];
  }
  return { data, fwhm };
}
