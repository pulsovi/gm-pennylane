import { apiRequest  } from './core.js';
import type { RawThirdparty, ThirdParty } from './types.d.js'

type Thirdparty = [direction: 'customer'|'supplier', thirdparty: RawThirdparty];

export async function getThirdparty (
  id
): Promise<Thirdparty> {
  const response = await apiRequest(`thirdparties/${id}`, null, 'GET');
  const json = await response?.json();
  return Object.entries(json)[0] as Thirdparty;
}
