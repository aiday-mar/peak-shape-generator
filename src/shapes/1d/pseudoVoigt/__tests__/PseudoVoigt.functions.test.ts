import {
  ROOT_2LN2_MINUS_ONE,
  GAUSSIAN_EXP_FACTOR,
} from '../../../util/constants';
import * as gaussian from '../gaussian/Gaussian';
import * as lorentzian from '../lorentzian/Lorentzian';
import * as pseudoVoigt from '../pseudoVoigt/PseudoVoigt';

describe('PseudoVoigt', () => {
  it('height of 5', () => {
    const data = pseudoVoigt.getData({ fwhm: 10, height: 5 });
    const center = Math.floor((data.length - 1) / 2);
    expect(data[center]).toBeCloseTo(5, 4);
  });
  it('area with fix fwhm', () => {
    const mu = 0.5;
    const fwhm = 50;
    const data = pseudoVoigt.getData({ fwhm, mu: 0.5 });
    const area = data.reduce((a, b) => a + b, 0);
    expect(area).toBeCloseTo(0.99, 1);
    const height =
      1 /
      ((mu / Math.sqrt(-GAUSSIAN_EXP_FACTOR / Math.PI)) * fwhm +
        ((1 - mu) * fwhm * Math.PI) / 2);
    const computedArea = pseudoVoigt.getArea({ fwhm, mu, height });
    expect(computedArea).toBeCloseTo(1, 2);
  });
  it('odd fwhm', () => {
    const data = pseudoVoigt.getData({ length: 11, fwhm: 11, height: 1 });
    const center = Math.floor((data.length - 1) / 2);
    expect(data[center]).toBeCloseTo(1, 4);
    expect(data[center - 1]).toBeCloseTo(data[center + 1], 4);
    expect(data[center]).toBeGreaterThan(data[center + 1]);
  });
  it('even fwhm', () => {
    const data = pseudoVoigt.getData({ fwhm: 10, length: 10 });
    const center = Math.floor((data.length - 1) / 2);
    expect(data[center]).toBeCloseTo(data[center + 1], 4);
    expect(data[0]).toBeCloseTo(data[data.length - 1], 4);
  });
  it('width To fwhm', () => {
    const mu = 0.5;
    const width = 20;
    expect(pseudoVoigt.widthToFWHM(width, mu)).toBe(
      width * (mu * ROOT_2LN2_MINUS_ONE + 1),
    );
  });
  it('fwhm to width', () => {
    const mu = 0.5;
    const fwhm = 20;
    expect(pseudoVoigt.fwhmToWidth(fwhm, mu)).toBe(
      fwhm / (mu * ROOT_2LN2_MINUS_ONE + 1),
    );
  });
  it('change height should change area', () => {
    const area = pseudoVoigt.getArea({ fwhm: 100, height: 1 });
    expect(pseudoVoigt.getArea({ fwhm: 100, height: 2 })).toBeCloseTo(
      2 * area,
      4,
    );
  });
  it('change mu should change area', () => {
    expect(pseudoVoigt.getArea({ fwhm: 100, height: 1, mu: 0 })).toBeCloseTo(
      lorentzian.getArea({ fwhm: 100, height: 1 }),
      4,
    );
    expect(pseudoVoigt.getArea({ fwhm: 100, height: 1, mu: 1 })).toBeCloseTo(
      gaussian.getArea({ fwhm: 100, height: 1 }),
      4,
    );
  });
  it('A change in mu should keep the same area', () => {
    const fwhm = 5;
    for (let i = 0; i < 11; i++) {
      const mu = i * 0.1;
      const data = pseudoVoigt.getData({ mu, fwhm });
      const area = data.reduce((a, b) => a + b, 0);
      expect(area).toBeCloseTo(0.9999, 3);
    }
  });
});