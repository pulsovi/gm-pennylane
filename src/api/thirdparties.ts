import { apiRequest  } from './core.js';
import type { RawThirdparty, ThirdParty } from './types.d.js'

interface Thirdparty {
  direction: 'customer'|'supplier';
  thirdparty: RawThirdparty;
}

export async function getThirdparty (
  id
): Promise<Thirdparty> {
  const response = await apiRequest(`thirdparties/${id}`, null, 'GET');
  const json = await response?.json();
  const [direction, thirdparty] = Object.entries(json)[0];
  return { direction, thirdparty } as Thirdparty;
}
