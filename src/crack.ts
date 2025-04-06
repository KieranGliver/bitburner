import { NS, Server } from "@ns";
import { getServerList } from "./utils";
import { growFile, weakFile, hackFile } from "./data";

export function crackServer(ns:NS, server:string | Server) {
    const portNum = typeof server === "string"? ns.getServerNumPortsRequired(server) : ns.getServerNumPortsRequired(server.hostname);
    const hostname = typeof server === "string"? server : server.hostname;

    ns.scp(growFile, hostname);
    ns.scp(weakFile, hostname);
    ns.scp(hackFile, hostname);

    if (portNum > 4 && ns.fileExists("SQLInject.exe")) { ns.sqlinject(hostname); }
    if (portNum > 3 && ns.fileExists("HTTPWorm.exe")) { ns.httpworm(hostname); }
    if (portNum > 2 && ns.fileExists("relaySMTP.exe")) { ns.relaysmtp(hostname); }
    if (portNum > 1 && ns.fileExists("FTPCrack.exe")) { ns.ftpcrack(hostname); }
    if (portNum > 0 && ns.fileExists("BruteSSH.exe")) { ns.brutessh(hostname); }

    ns.nuke(hostname);  
}

export async function main(ns: NS): Promise<void> {
    // Get all servers not purchased by the player and not home
    const servers = getServerList(ns).filter((hostname) => !ns.getServer(hostname).purchasedByPlayer && hostname != "home");

    for (const hostname of servers) {
          crackServer(ns, hostname);
    }
}