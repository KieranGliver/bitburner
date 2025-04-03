import { NS } from "@ns";
import { getServerList, crackServer } from "./functions";

export async function main(ns: NS): Promise<void> {

    const servers = getServerList(ns).filter((hostname) => !ns.getServer(hostname).purchasedByPlayer && hostname != "home");

    for (const hostname of servers) {
          crackServer(ns, hostname);
    }

}