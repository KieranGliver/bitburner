import type { NS } from '@ns';

const liquid: number = 0.7;
const maxRam: number = 1048576;
const minRam: number = 2;

export async function main(ns: NS): Promise<void> {
	// Set up logging and disable unnecessary logs
	ns.ui.openTail();
	ns.disableLog('sleep');
	ns.disableLog('getServerMaxRam');
	ns.clearLog();

	function findMinRam(serverList: string[]) {
		let min = maxRam;
		for (const hostname of serverList) {
			min = Math.min(min, ns.getServerMaxRam(hostname));
		}
		return min;
	}

	function findMaxPurchase() {
		let max = minRam;
		const liquidMoney = ns.getPlayer().money * liquid;
		while (max < maxRam && ns.getPurchasedServerCost(max * 2) < liquidMoney) {
			max = max * 2;
		}
		return max;
	}

	function findMaxUpgrade(hostname: string) {
		let max = ns.getServerMaxRam(hostname);
		const liquidMoney = ns.getPlayer().money * liquid;
		while (
			max < maxRam &&
			ns.getPurchasedServerUpgradeCost(hostname, max * 2) < liquidMoney
		) {
			max = max * 2;
		}
		return max;
	}

	function isMaxed(serverList: string[]): boolean {
		if (serverList.length < 1) {
			return false;
		}
		for (const hostname of serverList) {
			if (ns.getServerMaxRam(hostname) !== maxRam) {
				return false;
			}
		}
		return true;
	}

	function updateDisplay(serverList: string[], log: string) {
		ns.clearLog();
		ns.print('~~~~~~~~~~~~~~~~~~~ Server List ~~~~~~~~~~~~~~~~~~~');
		ns.print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		for (const hostname of serverList) {
			ns.print(
				`Server Name: ${hostname}, Ram: ${ns.getServerMaxRam(hostname)}`,
			);
		}
		ns.print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		ns.print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		ns.print(log);
	}

	let serverList: string[] = ns.getPurchasedServers();
	let log = 'Hello!';

	while (!isMaxed(serverList)) {
		serverList = ns.getPurchasedServers();

		if (serverList.length < ns.getPurchasedServerLimit()) {
			const maxPurchase = findMaxPurchase();
			const hostname = ns.purchaseServer(
				`pserv-${serverList.length}`,
				maxPurchase,
			);
			log = `Bought server with ${maxPurchase} ram named ${hostname}`;
		} else {
			const min = findMinRam(serverList);
			const minServer = serverList.find(
				(hostname) => ns.getServerMaxRam(hostname) === min,
			);
			if (minServer && findMaxUpgrade(minServer) > min) {
				const maxUpgrade = findMaxUpgrade(minServer);
				ns.upgradePurchasedServer(minServer, maxUpgrade);
				log = `Upgraded server with ${ns.formatRam(min)} to ${ns.formatRam(maxUpgrade)} named ${minServer}`;
			}
		}

		updateDisplay(serverList, log);

		await ns.sleep(100);
	}

	ns.toast('You Maxed out servers!');
	ns.ui.closeTail();
}
