import { findElem, waitFunc } from "../_";

export type PageName = 'invoiceDetail';

/**
 * Wait for a page given by its ID.
 *
 * @return Element which can be used to test wether the page reloads. Compatible with isPage()
 */
export async function waitPage (pageName: PageName): Promise<Element>
export async function waitPage (pageName: string): Promise<never>
export async function waitPage (pageName: string): Promise<Element|never> {
    return await waitFunc(() => isPage(pageName));
}

/**
 * Test if current page match the given pageName id.
 *
 * @return Element A ref element which can be used to test wether the page is
 *  reloaded if page match, false otherwise.
 */
export function isPage (pageName: PageName): Element|false;
export function isPage (pageName: string): never;
export function isPage (pageName: string): Element|false|never {
    switch (pageName) {
        case 'invoiceDetail': return findElem('h4', 'Réconciliation') ?? false;
        default: throw new Error(`unknown page required : "${pageName}"`);
    }
}
