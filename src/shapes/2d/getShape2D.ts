import type { Shape2D } from './Shape2D';
import { Gaussian2D } from './gaussian2D/Gaussian2D';

/**
 * Generate a instance of a specific kind of shape.
 */
export function getShape2D(
  /** Kind of shape from which to create a shape */
  shape: Shape2D) {
  const { kind } = shape;
  switch (kind) {
    case 'gaussian':
      return new Gaussian2D(shape);
    default: {
      const unHandled: never = kind;
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw Error(`Unknown distribution ${unHandled}`);
    }
  }
}
