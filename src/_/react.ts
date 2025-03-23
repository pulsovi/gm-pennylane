export function getReact (elem?: Element | null, up = 0) {
  if (!elem) return null;

  const keys = Object.getOwnPropertyNames(elem);
  const fiberKey = keys.find(key => key.startsWith('__reactFiber'));
  if (!fiberKey) return null;

  const fiber = elem[fiberKey];
  let component = fiber.return;
  for (let i = 0; i < up; ++i) component = component.return;
  return component;
}

export function getReactProps (elem?: Element | null, up = 0) {
  return getReact(elem, up)?.memoizedProps;
}

