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
			const maxMoney = ns.getServerMaxMoney(hostname);
			const avialMoney = ns.getServerMoneyAvailable(hostname);

			const left = `{ ${'$'.repeat(Math.floor((avialMoney / maxMoney) * 10))}${'0'.repeat(10 - Math.floor((avialMoney / maxMoney) * 10))} } | ${hostname} | ${Math.round((ns.getServerSecurityLevel(hostname)) - (ns.getServerMinSecurityLevel(hostname)))}`;
			const right = `${ns.formatNumber(avialMoney)} / ${ns.formatNumber(maxMoney)}`;
			serverData.push(
				left + ' '.repeat(Math.max(56 - left.length - right.length, 0)) + right,
			);
		}

		return serverData;
	}

    ns.ui.openTail();

	// @ignore-infinite
	while (true) {
		const serverList = getServerList(ns);
		const tailW = 60;

        serverList.pop(); // Remove home server
		const header = createUI('Server Display', tailW, 5);

		const serverUI = createUI(
			formatServerList(ns, serverList.filter(isHackable)),
			tailW,
			1,
			'~',
		);

		const ram = `${ns.formatRam(
			serverList.reduce((ac, cVal) => ac + ns.getServerUsedRam(cVal), 0),
		)} / ${ns.formatRam(
			serverList.reduce((ac, cVal) => ac + ns.getServerMaxRam(cVal), 0),
		)}`;
		const footer = createUI(ram, tailW, 5);

		const countNewLines = (str: string) => (str.match(/\n/g) || []).length;

		const tailH =
			countNewLines(header) +
			countNewLines(serverUI) +
			countNewLines(footer)

		await displayUI(ns, header + serverUI + footer, 10, {x: tailW, y: tailH});
	}
}
