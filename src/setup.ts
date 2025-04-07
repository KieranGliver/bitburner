import type { NS } from '@ns';
import { growFile, hackFile, weakFile } from './data';
import { crackServer, getServerList, runScript } from './utils';

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

	const serverDisplayPid = runScript(ns, serverList, 'server-display.js', 1);
	if (serverDisplayPid.length === 0) {
		ns.print('ERROR: server-manager.js failed to start');
	}

	const serverManagerPid = runScript(ns, serverList, 'server-manager.js', 1);

	if (serverManagerPid.length === 0) {
		ns.print('ERROR: server-manager.js failed to start');
	}

	const hackServers = crackServers.filter(
		(hostname) =>
			ns.getServerRequiredHackingLevel(hostname) <= ns.getHackingLevel(),
	);

	// run server-hack.js on all valid servers
	/*
	for (const hostname of hackServers) {
		const processList = runScript(ns, serverList, 'server-hack.js', 1, hostname);
		if (processList.length > 0) {
			ns.print(`Running server-hack.js on ${hostname} with PID(s):`);
			ns.print(...processList.map((process) => process.pid));
		}
	}
    */

	//run server-hack.js on 'n00dles'
	const processList = runScript(ns, serverList, 'server-hack.js', 1, 'n00dles');
	if (processList.length > 0) {
		ns.print('Running server-hack.js on n00dles with PID:');
		ns.print(...processList.map((process) => process.pid));
	}

	ns.ui.openTail();
}
