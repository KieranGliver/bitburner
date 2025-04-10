import type { NS } from '@ns';
import { growFile, hackFile, weakFile } from './data';
import { getServerList, runScript } from './utils';

export async function main(ns: NS): Promise<void> {
	// Disable logs
	ns.disableLog('disableLog');
	ns.disableLog('getServerMaxMoney')
	ns.disableLog('getServerMoneyAvailable');
	ns.disableLog('getServerSecurityLevel');
	ns.disableLog('getServerMinSecurityLevel');
	ns.disableLog('getHackingLevel');
	ns.disableLog('getServerRequiredHackingLevel');


	// Checks for the number of arguments given to the script
	if (ns.args.length !== 1) {
		ns.print(`ERROR: ${ns.args.length} arguments given. Requires 1 (hostname)`);
		ns.ui.openTail();
		ns.exit();
	}

	const target = ns.args[0] as string;

	// Check if the target server is valid
	try {
		if (!ns.hasRootAccess(target)) {
			ns.print(`Warn: Do not have root access on ${target}`);
			ns.ui.openTail();
			ns.exit();
		}
		ns.hasRootAccess(target);
	} catch (error) {
		// Hostname does not exist
		ns.ui.openTail();
		ns.exit();
	}

	if (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) {
		ns.print(`Warn: Player doesn't have hacking skill to hack ${target}`);
		ns.ui.openTail();
		ns.exit();
	}

	function threadsToWeakenServer(hostname: string) {
		return Math.ceil(
			(ns.getServerSecurityLevel(hostname) -
				ns.getServerMinSecurityLevel(hostname)) /
				0.05,
		);
	}

	function threadsToMaxMoney(hostname: string) {
		const max = ns.getServerMaxMoney(hostname);
		const avail = Math.max(ns.getServerMoneyAvailable(hostname), 1);
		const multi = max / avail;
		return Math.ceil(ns.growthAnalyze(hostname, multi));
	}

	function threadsToHackMoney(hostname: string, percentRemaining: number) {
		const max = ns.getServerMaxMoney(hostname);
		const avail = ns.getServerMoneyAvailable(hostname);
		const hackAmount = (avail / max - percentRemaining) * max;
		if (hackAmount > 0) {
			return Math.ceil(
				ns.hackAnalyzeThreads(hostname, hackAmount) /
					ns.hackAnalyzeChance(hostname),
			);
		}
		return 0;
	}

	const moneyThresh = ns.getServerMaxMoney(target) * 0.5;
	const securityThresh = ns.getServerMinSecurityLevel(target) + 2.5;

	// @ignore-infinite
	while (true) {
		const serverList = getServerList(ns);
		let waitTime = 0;
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			const threads = threadsToWeakenServer(target);
			runScript(ns, serverList, weakFile, threads, target);
			waitTime = ns.getWeakenTime(target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			const threads = threadsToMaxMoney(target);
			runScript(ns, serverList, growFile, threads, target);
			waitTime = ns.getGrowTime(target);
		} else {
			const threads = threadsToHackMoney(target, 0.2);
			runScript(ns, serverList, hackFile, threads, target);
			waitTime = ns.getHackTime(target);
		}

		// Add a small buffer to waitTime
		waitTime += 100;
		await ns.sleep(waitTime);
	}
}
