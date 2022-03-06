import { DoubleArray } from 'cheminfo-types';

import { GetData1DOptions } from './GetData1DOptions';

export interface Shape1DClass {
  /** Full width at maximum height */
  fwhm: number;
  /**
   * Calculate the height depending of fwhm and area.
   */
  calculateHeight(area?: number): number;
  /**
   * Return a parameterized function of a gaussian shape (see README for equation).
   * @returns - the y value of gaussian with the current parameters.
   */
  fct(x: number): number;
  /**
   * Compute the value of Full Width at Half Maximum (FWHM) from the width between the inflection points.
   * for more information check the [mathworld page](https://mathworld.wolfram.com/GaussianFunction.html)
   * @returns fwhm
   */
  widthToFWHM(width: number): number;
  /**
   * Compute the value of width between the inflection points from Full Width at Half Maximum (FWHM).
   * for more information check the [mathworld page](https://mathworld.wolfram.com/GaussianFunction.html)
   * @param fwhm - Full Width at Half Maximum.
   * @returns width
   */
  fwhmToWidth(fwhm?: number): number;
  /**
   * Calculate the area of a specific shape.
   * @returns returns the area of the specific shape and parameters.
   */
  getArea(height?: number): number;
  /**
   * Calculate the number of times FWHM allows to reach a specific area coverage.
   * @param [area=0.9999] Expected area to be covered.
   */
  getFactor(area?: number): number;
  /**
   * Calculate intensity array of a gaussian shape.
   * @returns Intensity values.
   */
  getData(options?: GetData1DOptions): DoubleArray;
  /**
   * Returns an array of the different parameters characterizing the shape
   */
  getParameters(): string[];
}
