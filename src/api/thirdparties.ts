import { apiRequest  } from './core.js';
import { APIThirdparty } from './Thirdparty/index.js';
import { Direction } from './types.js';

export interface Thirdparty {
  direction: Direction;
  thirdparty: APIThirdparty[Direction];
}

/**
 * @param id The ID of the supplier or customer
 */
export async function getThirdparty (
  id
): Promise<Thirdparty|null> {
  if (!id) throw new Error(`id is mandatory "${id}" given`);
  const response = await apiRequest(`thirdparties/${id}`, null, 'GET');
  const json = await response?.json();
  if (!json) return json;
  const data = APIThirdparty.Create(json);
  const [direction, thirdparty] = Object.entries(data)[0] as [Direction, APIThirdparty[Direction]];
  return { direction, thirdparty };
}
