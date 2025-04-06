import { NS } from "@ns";
import { crackServer, getServerList, runScript } from "./utils";

// Total scirpt ram cost should be under 8GB to allow to run on new saves
export async function main(ns: NS): Promise<void> {
    const serverList = getServerList(ns);
    const crackServers = serverList.filter((hostname) => !ns.getPurchasedServers().includes(hostname) && hostname != "home");

    for (const hostname of serverList) {
        ns.killall(hostname);
    }

    for (const hostname of crackServers) {
        crackServer(ns, hostname);
    }

    const serverManagerPid = runScript(ns, serverList, "server-manager.js", 1);

    if (serverManagerPid.length == 0) {
        ns.print(`ERROR: server-manager.js failed to start`);
    }

    const hackServers = crackServers.filter((hostname) =>  ns.getServerRequiredHackingLevel(hostname) <= ns.getPlayer().skills.hacking);

    // run server-hack.js on all valid servers
    for (const hostname of hackServers) {
        const pids = runScript(ns, serverList, "server-hack.js", 1, hostname);
        if (pids.length > 0) {
            ns.print(`Running server-hack.js on ${hostname} with PID(s):`);
            ns.print(...pids);
        }
    }

    ns.ui.openTail();
}