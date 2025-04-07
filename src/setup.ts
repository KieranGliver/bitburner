import type { NS } from '@ns';
import { crackServer, getServerList, runScript } from './utils';
import { growFile, hackFile, weakFile } from './data';

// Total scirpt ram cost should be under 8GB to allow to run on new saves
export async function main(ns: NS): Promise<void> {
	const serverList = getServerList(ns);
	const crackServers = serverList.filter(
		(hostname) =>
			!ns.getPurchasedServers().includes(hostname) && hostname !== 'home',
	);
	for (const hostname of serverList) {
        ns.scp(growFile, hostname);
        ns.scp(weakFile, hostname);
        ns.scp(hackFile, hostname);
		ns.killall(hostname);
	}

	for (const hostname of crackServers) {
		crackServer(ns, hostname);
	}

	const serverManagerPid = runScript(ns, serverList, 'server-manager.js', 1);

	if (serverManagerPid.length === 0) {
		ns.print('ERROR: server-manager.js failed to start');
	}

	const hackServers = crackServers.filter(
		(hostname) =>
			ns.getServerRequiredHackingLevel(hostname) <=
			ns.getHackingLevel(),
	);

	// run server-hack.js on all valid servers
	for (const hostname of hackServers) {
		const processList = runScript(ns, serverList, 'server-hack.js', 1, hostname);
		if (processList.length > 0) {
			ns.print(`Running server-hack.js on ${hostname} with PID(s):`);
			ns.print(...processList.map((process) => process.pid));
		}
	}

	ns.ui.openTail();
}
