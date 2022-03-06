import type { Shape1D } from './Shape1D';
import { Gaussian } from './gaussian/Gaussian';
import { Lorentzian } from './lorentzian/Lorentzian';
import { PseudoVoigt } from './pseudoVoigt/PseudoVoigt';

/**
 * Generate an instance of a specific kind of shape.
 */
export function getShape1D(
  /** Kind of shape from which to create a shape */
  shape: Shape1D) {
  const { kind } = shape;

  switch (kind) {
    case 'gaussian':
      return new Gaussian(shape);
    case 'lorentzian':
      return new Lorentzian(shape);
    case 'pseudoVoigt':
      return new PseudoVoigt(shape);
    default: {
      throw Error(`Unknown distribution ${kind as string}`);
    }
  }
}
