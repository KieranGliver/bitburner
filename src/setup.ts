import { NS } from "@ns";
import { getServerList, runScript } from "./utils";

export async function main(ns: NS): Promise<void> {
    const serverList = getServerList(ns);

    for (const server of serverList) {
        ns.killall(server);
    }

    const crackPid = runScript(ns, serverList, "crack.js");

    // Stop running if crack.js fails to run
    if (!crackPid) {
        ns.exit();
    }

    while (ns.getRunningScript(crackPid)) {
        await ns.sleep(500);
    }

    const targetServers = getServerList(ns).filter((hostname) => !ns.getPurchasedServers().includes(hostname) && hostname != "home" && ns.getServerRequiredHackingLevel(hostname) <= ns.getPlayer().skills.hacking);

    // run server-hack.js on all valid servers
    for (const server of targetServers) {
        runScript(ns, serverList, "server-hack.js", 1, server);
    }

    ns.ui.openTail();
}