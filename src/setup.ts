import { NS } from "@ns";
import { crackServer, getServerList, runScript } from "./utils";

export async function main(ns: NS): Promise<void> {
    const serverList = getServerList(ns);
    const crackServers = serverList.filter((hostname) => !ns.getPurchasedServers().includes(hostname) && hostname != "home");

    for (const server of serverList) {
        ns.killall(server);
    }

    for (const server of crackServers) {
        crackServer(ns, server);
    }

    const hackServers = crackServers.filter((hostname) =>  ns.getServerRequiredHackingLevel(hostname) <= ns.getPlayer().skills.hacking);

    // run server-hack.js on all valid servers
    for (const server of hackServers) {
        runScript(ns, serverList, "server-hack.js", 1, server);
    }

    ns.ui.openTail();
}