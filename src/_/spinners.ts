/** @from https://github.com/sindresorhus/cli-spinners */
import rawSpinners from './spinners.json' with {type: 'json'};

export interface Spinner {
  interval: number;
  frames: string[];
}

const spinners = rawSpinners as Record<string, Spinner>;

export default spinners;

const spinnersList = Object.keys(spinners);

export function randomSpinner(): Spinner {
  const randomIndex = Math.floor(Math.random() * spinnersList.length);
  const spinnerName = spinnersList[randomIndex];
  return spinners[spinnerName];
}
