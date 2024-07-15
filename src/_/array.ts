export function getRandomArrayItem (array) {
  if (!array.length) return null;
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}
