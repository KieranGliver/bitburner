import type { NS } from '@ns';
import { createUI, displayUI, getServerList } from './utils';

export async function main(ns: NS): Promise<void> {
	const isHackable = (hostname: string) =>
		ns.getServerRequiredHackingLevel(hostname) <= ns.getHackingLevel() &&
		ns.getServerMaxMoney(hostname) > 0 &&
		ns.hasRootAccess(hostname);

	function formatServerList(ns: NS, serverList: string[]): string[] {
		const serverData: string[] = [];

		for (const hostname of serverList) {
			const maxMoney = ns.getServerMaxMoney(hostname) ?? 0;
			const avialMoney = ns.getServerMoneyAvailable(hostname) ?? 0;

			const left = `{ ${'$'.repeat(Math.floor((avialMoney / maxMoney) * 10))}${'0'.repeat(10 - Math.floor((avialMoney / maxMoney) * 10))} } | ${hostname} | ${Math.round((ns.getServerSecurityLevel(hostname) ?? 0) - (ns.getServerMinSecurityLevel(hostname) ?? 0))}`;
			const right = `${ns.formatNumber(avialMoney)} / ${ns.formatNumber(maxMoney)}`;
			serverData.push(
				left + ' '.repeat(Math.max(56 - left.length - right.length, 0)) + right,
			);
		}

		return serverData;
	}

	// @ignore-infinite
	while (true) {
		ns.ui.openTail();
		const serverList = getServerList(ns);

		const header = createUI('Server Display', 60, 5);

		const serverUI = createUI(
			formatServerList(ns, serverList.filter(isHackable)),
			60,
			1,
			'~',
		);

		const ram = `${ns.formatRam(
			serverList.reduce((ac, cVal) => ac + ns.getServerUsedRam(cVal), 0),
		)} / ${ns.formatRam(
			serverList.reduce((ac, cVal) => ac + ns.getServerMaxRam(cVal), 0),
		)}`;
		const footer = createUI(ram, 60, 5);

		await displayUI(ns, header + serverUI + footer, 10);
	}
}
