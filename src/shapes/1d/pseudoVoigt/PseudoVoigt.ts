import {
  GAUSSIAN_EXP_FACTOR,
  ROOT_2LN2_MINUS_ONE,
  ROOT_PI_OVER_LN2,
} from '../../../util/constants';
import { GetData1DOptions } from '../GetData1DOptions';
import { Shape1DClass } from '../Shape1DClass';
import { gaussianFct, getGaussianFactor } from '../gaussian/Gaussian';
import { lorentzianFct, getLorentzianFactor } from '../lorentzian/Lorentzian';

export interface PseudoVoigtClassOptions {
  /**
   * Full width at half maximum.
   * @default 500
   */
  fwhm?: number;
  /**
   * Ratio of gaussian contribution in the shape
   * @default 0.5
   */
  mu?: number;
}

interface GetPseudoVoigtAreaOptions {
  /**
   * The maximum intensity value of the shape
   * @default 1
   */
  height?: number;
  /**
   * Full width at half maximum.
   * @default 500
   */
  fwhm?: number;
  /**
   * Ratio of gaussian contribution in the shape
   * @default 0.5
   */
  mu?: number;
}

interface CalculatePseudoVoightHeightOptions {
  /**
   * @default 1
   */
  fwhm?: number;
  /**
   * @default 0.5
   */
  mu?: number;
  /**
   * @default 1
   */
  area?: number;
}

export class PseudoVoigt implements Shape1DClass {
  /** Full width at maximum height */
  public fwhm: number;
  /**
   * Ratio of gaussian contribution in the shape
   * @default 0.5
   */
  public mu: number;

  public constructor(options: PseudoVoigtClassOptions = {}) {
    const { fwhm = 500, mu = 0.5 } = options;

    this.mu = mu;
    this.fwhm = fwhm;
  }

  public fwhmToWidth(fwhm = this.fwhm, mu = this.mu) {
    return pseudoVoigtFwhmToWidth(fwhm, mu);
  }

  public widthToFWHM(width: number, mu: number = this.mu) {
    return pseudoVoigtWidthToFWHM(width, mu);
  }

  public fct(x: number) {
    return pseudoVoigtFct(x, this.fwhm, this.mu);
  }

  public getArea(height = 1) {
    return getPseudoVoigtArea({ fwhm: this.fwhm, height, mu: this.mu });
  }

  public getFactor(area?: number) {
    return getPseudoVoigtFactor(area);
  }

  public getData(options: GetData1DOptions = {}) {
    const {
      length,
      factor,
      height = calculatePseudoVoigtHeight({
        fwhm: this.fwhm,
        mu: this.mu,
        area: 1,
      }),
    } = options;
    return getPseudoVoigtData(this, { factor, length, height });
  }

  public calculateHeight(area = 1) {
    return calculatePseudoVoigtHeight({ fwhm: this.fwhm, mu: this.mu, area });
  }

  public getParameters() {
    return ['fwhm', 'mu'];
  }
}

export const calculatePseudoVoigtHeight = (
  options: CalculatePseudoVoightHeightOptions = {},
) => {
  let { fwhm = 1, mu = 0.5, area = 1 } = options;
  return (2 * area) / (fwhm * (mu * ROOT_PI_OVER_LN2 + (1 - mu) * Math.PI));
};

export const pseudoVoigtFct = (x: number, fwhm: number, mu: number) => {
  return (1 - mu) * lorentzianFct(x, fwhm) + mu * gaussianFct(x, fwhm);
};

export const pseudoVoigtWidthToFWHM = (width: number, mu = 0.5) => {
  return width * (mu * ROOT_2LN2_MINUS_ONE + 1);
};

export const pseudoVoigtFwhmToWidth = (fwhm: number, mu = 0.5) => {
  return fwhm / (mu * ROOT_2LN2_MINUS_ONE + 1);
};

export const getPseudoVoigtArea = (options: GetPseudoVoigtAreaOptions) => {
  const { fwhm = 500, height = 1, mu = 0.5 } = options;
  return (fwhm * height * (mu * ROOT_PI_OVER_LN2 + (1 - mu) * Math.PI)) / 2;
};

export const getPseudoVoigtFactor = (area = 0.9999, mu = 0.5) => {
  return mu < 1 ? getLorentzianFactor(area) : getGaussianFactor(area);
};

export const getPseudoVoigtData = (
  shape: PseudoVoigtClassOptions = {},
  options: GetData1DOptions = {},
) => {
  let { fwhm = 500, mu = 0.5 } = shape;
  let {
    length,
    factor = getPseudoVoigtFactor(0.999, mu),
    height = calculatePseudoVoigtHeight({ fwhm, mu, area: 1 }),
  } = options;

  if (!height) {
    height =
      1 /
      ((mu / Math.sqrt(-GAUSSIAN_EXP_FACTOR / Math.PI)) * fwhm +
        ((1 - mu) * fwhm * Math.PI) / 2);
  }

  if (!length) {
    length = Math.min(Math.ceil(fwhm * factor), Math.pow(2, 25) - 1);
    if (length % 2 === 0) length++;
  }

  const center = (length - 1) / 2;
  const data = new Float64Array(length);
  for (let i = 0; i <= center; i++) {
    data[i] = pseudoVoigtFct(i - center, fwhm, mu) * height;
    data[length - 1 - i] = data[i];
  }

  return data;
};
