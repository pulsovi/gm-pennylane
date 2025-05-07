/**
 * Find the React component that rendered the given element.
 * @param elem The element to find the React component for.
 * @param up The number of levels up the component tree to traverse.
 * @returns The React component that rendered the given element.
 */
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

/**
 * Find the React props that rendered the given element.
 * @param elem The element to find the React props for.
 * @param up The number of levels up the component tree to traverse.
 * @returns The React props that rendered the given element.
 */
export function getReactProps (elem?: Element | null, up = 0) {
  return getReact(elem, up)?.memoizedProps;
}

/**
 * Find the React component that rendered the given element.
 * @param elem The element to find the React component for.
 * @param up The number of levels up the component tree to traverse.
 * @returns The React component that rendered the given element.
 */
export function getReactComponent (elem?: Element | null, up = 0) {
  return getReact(elem, up)?.memoizedState;
}

/**
 * Find the level of the component tree which have given props by name and returns the prop value.
 * @param elem The element to find the React props for.
 * @param propName The prop to find.
 * @returns The level of the component tree which have given props by name.
 */
export function findReactProp (elem: Element | null, propName: string): number | null;
export function findReactProp (elem: Element | null, propName?: never): Set<string>;
export function findReactProp (elem: Element | null, propName?: string): number | Set<string> | null {
  const propList = new Set<string>();
  let i = 0;

  while (elem) {
    const props = getReactProps(elem, i);
    if (!props) break;
    if (!propName) Object.keys(props).forEach(key => propList.add(key));
    else if (props && propName in props) return i;
    ++i;
  }
  if (!propName) return propList;
  return null;
}
