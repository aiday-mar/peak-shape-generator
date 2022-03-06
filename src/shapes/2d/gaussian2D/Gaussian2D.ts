import { GAUSSIAN_EXP_FACTOR } from '../../../util/constants';
import {
  getGaussianFactor,
  gaussianFwhmToWidth,
  gaussianWidthToFWHM,
} from '../../1d/gaussian/Gaussian';
import type { GetData2DOptions } from '../GetData2DOptions';
import { Shape2DClass } from '../Shape2DClass';

export interface XYNumber {
  x: number;
  y: number;
}

interface CalculateGaussian2DHeightOptions {
  /** standard deviation */
  sd?: number | XYNumber;
  /**
   * @default 50
   */
  fwhm?: number | XYNumber;
  /**
   * @default 1
   */
  volume?: number;
}

export interface Gaussian2DClassOptions {
  /**
   * Full width at half maximum.
   * Could specify the value for each axis by a xy object or both by a number.
   * @default 50
   */
  fwhm?: number | XYNumber;
  /**
   * The halft width between the inflection points or standard deviation.
   * If it is defined the fwhm would be re-assigned.
   */
  sd?: number | XYNumber;
}

/**
 * Calculate the Volume of gaussian shape.
 * @returns The volume of the specific shape and parameters.
 */
export interface GetGaussian2DVolumeOptions {
  /**
   * The maximum intensity value of the shape
   * @default 1
   */
  height?: number;
  /**
   * Full width at half maximum.
   * Could specify the value for each axis by a xy object or both by a number.
   * @default 50
   */
  fwhm?: number | XYNumber;
  /**
   * The halft width between the inflection points or standard deviation.
   * If it is defined the fwhm would be re-assigned.
   */
  sd?: number | XYNumber;
}

export class Gaussian2D implements Shape2DClass {
  public fwhmX: number;
  public fwhmY: number;

  public constructor(options: Gaussian2DClassOptions = {}) {
    let { fwhm = 50, sd } = options;

    fwhm = ensureFWHM2D(fwhm, sd);

    this.fwhmX = fwhm.x;
    this.fwhmY = fwhm.y;
  }

  public fct(x: number, y: number) {
    return gaussian2DFct(x, y, this.fwhmX, this.fwhmY);
  }

  public getData(options: GetData2DOptions = {}) {
    return getGaussian2DData(
      {
        fwhm: { x: this.fwhmX, y: this.fwhmY },
      },
      options,
    );
  }

  public getFactor(volume = 1) {
    return getGaussianFactor(volume);
  }

  public getVolume(
    height = calculateGaussian2DHeight({
      fwhm: { x: this.fwhmX, y: this.fwhmY },
      volume: 1,
    }),
  ) {
    return getGaussian2DVolume({
      fwhm: { x: this.fwhmX, y: this.fwhmY },
      height,
    });
  }

  public widthToFWHM(width: number) {
    return gaussianWidthToFWHM(width);
  }

  public fwhmToWidth(fwhm: number) {
    return gaussianFwhmToWidth(fwhm);
  }

  public calculateHeight(volume = 1) {
    return calculateGaussian2DHeight({
      volume,
      fwhm: { x: this.fwhmX, y: this.fwhmY },
    });
  }

  public set fwhm(fwhm: number | XYNumber) {
    fwhm = ensureXYNumber(fwhm);
    this.fwhmX = fwhm.x;
    this.fwhmY = fwhm.y;
  }
}

export const gaussian2DFct = (
  x: number,
  y: number,
  xFWHM: number,
  yFWHM: number,
) => {
  return Math.exp(
    GAUSSIAN_EXP_FACTOR * (Math.pow(x / xFWHM, 2) + Math.pow(y / yFWHM, 2)),
  );
};

export const getGaussian2DData = (
  shape: Gaussian2DClassOptions,
  options: GetData2DOptions = {},
) => {
  let { fwhm = 50, sd } = shape;

  fwhm = ensureFWHM2D(fwhm, sd);

  let {
    factor = getGaussianFactor(),
    length = { x: 0, y: 0 },
    height = calculateGaussian2DHeight({ fwhm, volume: 1 }),
  } = options;

  factor = ensureXYNumber(factor);

  length = ensureXYNumber(length);

  for (const axis of ['x', 'y'] as const) {
    if (!length[axis]) {
      length[axis] = Math.min(
        Math.ceil(fwhm[axis] * factor[axis]),
        Math.pow(2, 25) - 1,
      );
      if (length[axis] % 2 === 0) length[axis]++;
    }
  }

  const xCenter = (length.x - 1) / 2;
  const yCenter = (length.y - 1) / 2;
  const data = new Array(length.x);
  for (let i = 0; i < length.x; i++) {
    data[i] = new Float64Array(length.y);
  }
  for (let i = 0; i < length.x; i++) {
    for (let j = 0; j < length.y; j++) {
      data[i][j] =
        gaussian2DFct(i - xCenter, j - yCenter, fwhm.x, fwhm.y) * height;
    }
  }
  return data;
};

export const calculateGaussian2DHeight = (
  options: CalculateGaussian2DHeightOptions = {},
) => {
  let { volume = 1, fwhm = 50, sd } = options;
  fwhm = ensureFWHM2D(fwhm, sd);
  return (volume * Math.LN2 * 4) / (Math.PI * fwhm.y * fwhm.x);
};

export const getGaussian2DVolume = (
  options: GetGaussian2DVolumeOptions = {},
) => {
  let { fwhm = 50, height = 1, sd } = options;

  fwhm = ensureFWHM2D(fwhm, sd);

  return (height * Math.PI * fwhm.y * fwhm.x) / Math.LN2 / 4;
};

function ensureXYNumber(input: number | XYNumber): XYNumber {
  return typeof input !== 'object' ? { x: input, y: input } : { ...input };
}

function ensureFWHM2D(fwhm?: number | XYNumber, sd?: number | XYNumber) {
  if (sd !== undefined) {
    let sdObject = ensureXYNumber(sd);
    return {
      x: gaussianWidthToFWHM(2 * sdObject.x),
      y: gaussianWidthToFWHM(2 * sdObject.y),
    };
  } else if (fwhm !== undefined) {
    return ensureXYNumber(fwhm);
  } else {
    throw new Error('ensureFWHM2D must have either fwhm or sd defined');
  }
}
