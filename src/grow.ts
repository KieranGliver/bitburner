import type { NS } from '@ns';

export async function main(ns: NS): Promise<void> {
	await ns.grow(ns.args[0] as string);
}
