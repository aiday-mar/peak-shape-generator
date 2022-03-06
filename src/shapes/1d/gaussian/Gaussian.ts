import {
  ROOT_2LN2,
  GAUSSIAN_EXP_FACTOR,
  ROOT_PI_OVER_LN2,
} from '../../../util/constants';
import erfinv from '../../../util/erfinv';
import type { GetData1DOptions } from '../GetData1DOptions';
import type { Shape1DClass } from '../Shape1DClass';

interface CalculateGaussianHeightOptions {
  /**
   * Full width at maximum height 
   * @default 500
   */
  fwhm?: number;
  /**
   * Area of gaussian
   * @default 1
   */
  area?: number;
  /**
   * Standard deviation
   */
  sd?: number;
}

export interface GaussianClassOptions {
  /**
   * Full width at half maximum.
   * @default 500
   */
  fwhm?: number;
  /**
   * The halft width between the inflection points or standard deviation.
   * If it is defined the fwhm would be re-assigned.
   */
  sd?: number;
}

interface GetGaussianAreaOptions {
  /**
   * The maximum intensity value of the shape.
   * @default 1
   */
  height?: number;
  /**
   * Full width at half maximum.
   * @default 500
   */
  fwhm?: number;
  /**
   * The halft width between the inflection points or standard deviation.
   * If it is defined the fwhm would be re-assigned.
   */
  sd?: number;
}

export class Gaussian implements Shape1DClass {
  /**
   * Full width at half maximum.
   * @default 500
   */
  public fwhm: number;

  public constructor(options: GaussianClassOptions = {}) {
    const { fwhm = 500, sd } = options;

    this.fwhm = sd ? gaussianWidthToFWHM(2 * sd) : fwhm;
  }

  public fwhmToWidth(fwhm = this.fwhm) {
    return gaussianFwhmToWidth(fwhm);
  }

  public widthToFWHM(width: number) {
    return gaussianWidthToFWHM(width);
  }

  public fct(x: number) {
    return gaussianFct(x, this.fwhm);
  }

  public getArea(height = calculateGaussianHeight({ fwhm: this.fwhm })) {
    return getGaussianArea({ fwhm: this.fwhm, height });
  }

  public getFactor(area?: number) {
    return getGaussianFactor(area);
  }

  public getData(options: GetData1DOptions = {}) {
    return getGaussianData(this, options);
  }

  public calculateHeight(area = 1) {
    return calculateGaussianHeight({ fwhm: this.fwhm, area });
  }

  public getParameters() {
    return ['fwhm'];
  }
}

export function calculateGaussianHeight(
  options: CalculateGaussianHeightOptions,
) {
  let { fwhm = 500, area = 1, sd } = options;

  if (sd) fwhm = gaussianWidthToFWHM(2 * sd);

  return (2 * area) / ROOT_PI_OVER_LN2 / fwhm;
}

/**
 * Calculate the height of the gaussian function of a specific width (fwhm) at a speicifc
 * x position (the gaussian is centered on x=0)
 * @param x
 * @param fwhm
 * @returns y
 */
export function gaussianFct(
  /** Value in which to evaluate gaussian */
  x: number, 
  /** Full width at maximum height */
  fwhm: number) {
  return Math.exp(GAUSSIAN_EXP_FACTOR * Math.pow(x / fwhm, 2));
}

export function gaussianWidthToFWHM(width: number) {
  return width * ROOT_2LN2;
}

export function gaussianFwhmToWidth(fwhm: number) {
  return fwhm / ROOT_2LN2;
}

export function getGaussianArea(options: GetGaussianAreaOptions) {
  let { fwhm = 500, sd, height = 1 } = options;

  if (sd) fwhm = gaussianWidthToFWHM(2 * sd);

  return (height * ROOT_PI_OVER_LN2 * fwhm) / 2;
}

export function getGaussianFactor(area = 0.9999) {
  return Math.sqrt(2) * erfinv(area);
}

export function getGaussianData(
  shape: GaussianClassOptions = {},
  options: GetData1DOptions = {},
) {
  let { fwhm = 500, sd } = shape;
  if (sd) fwhm = gaussianWidthToFWHM(2 * sd);

  let {
    length,
    factor = getGaussianFactor(),
    height = calculateGaussianHeight({ fwhm }),
  } = options;

  if (!length) {
    length = Math.min(Math.ceil(fwhm * factor), Math.pow(2, 25) - 1);
    if (length % 2 === 0) length++;
  }

  const center = (length - 1) / 2;
  const data = new Float64Array(length);
  for (let i = 0; i <= center; i++) {
    data[i] = gaussianFct(i - center, fwhm) * height;
    data[length - 1 - i] = data[i];
  }

  return data;
}
