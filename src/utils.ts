import { NS, ScriptArg, Server } from "@ns";
import { growFile, weakFile, hackFile } from "./data";

/**
 * Returns a list of servers the player can access based on available port opening programs.
 * @remark Ram Cost: 1.15 GB
 * - ns.getPurchasedServers(): 1.05 GB
 * - ns.fileExists(): 0.1 GB
 * @param ns - The Netscript environment.
 * @param allFlag - If true, includes all servers regardless of access level.
 * @returns An array of accessible server hostnames.
 */
export function getServerList(ns:NS, allFlag:boolean = false): Array<string> {

    // Arrays of all servers divided by number of ports required.
    const servers0Port = ["n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "nectar-net", "hong-fang-tea", "harakiri-sushi"];

    const servers1Port = ["neo-net", "CSEC", "zer0", "max-hardware", "iron-gym"];

    const servers2Port = ["phantasy", "silver-helix",  "omega-net",  "avmnite-02h",  "crush-fitness",  "johnson-ortho",  "the-hub"];

    const servers3Port = ["netlink", "rothman-uni", "summit-uni", "rho-construction", "I.I.I.I", "millenium-fitness", "computek", "catalyst"];

    const servers4Port = ["unitalife", "univ-energy", "zb-def", "applied-energetics", "run4theh111z", "syscore", "lexo-corp", "aevum-police", 
                        "global-pharm", "nova-med", ".", "alpha-ent", "snap-fitness"];
    
    const servers5Port = ["zb-institute", "galactic-cyber", "deltaone", "icarus", "defcomm", "infocomm", "microdyne", "stormtech", "kuai-gong", 
                        "b-and-a", "nwo", "megacorp", "vitalife", "4sigma", "blade", "omnia", "solaris", "zeus-med", "taiyang-digital", "titan-labs", 
                        "fulcrumtech", "helios", "powerhouse-fitness", "omnitek", "clarkinc", "ecorp", "fulcrumassets", "The-Cave", "aerocorp"];

    //if (ns.getServer("w0r1d_d43m0n")) {
    //    servers5Port.push("w0r1d_d43m0n");
    //}

    const ret: string[] = [];

    ret.push(...ns.getPurchasedServers().concat(servers0Port));

    // checks if have port openning file on home. Adds servers that can be accessed.
    if (ns.fileExists("BruteSSH.exe") || allFlag) { ret.push(...servers1Port); }
    if (ns.fileExists("FTPCrack.exe") || allFlag) { ret.push(...servers2Port); }
    if (ns.fileExists("relaySMTP.exe") || allFlag) { ret.push(...servers3Port); }
    if (ns.fileExists("HTTPWorm.exe") || allFlag) { ret.push(...servers4Port); }
    if (ns.fileExists("SQLInject.exe") || allFlag) { ret.push(...servers5Port); }
    
    ret.push("home");

    // Return list with home computer at end.
    return ret;
  
}

/**
 * Crack a server by running all available hacking programs on it.
 * @remark Ram Cost: 1.10 GB
 * - ns.scp: 0.6 GB
 * - ns.getServerNumPortsRequired: 0.1 GB
 * - ns.fileExists: 0.1 GB
 * - ns.sqlinject: 0.05 GB
 * - ns.httpworm: 0.05 GB
 * - ns.relaysmtp: 0.05 GB
 * - ns.ftpcrack: 0.05 GB
 * - ns.brutessh: 0.05 GB
 * - ns.nuke: 0.05 GB
 * @param ns - Netscript object
 * @param server - The server to crack, either as a string or a Server object.
 */
export function crackServer(ns:NS, server:string | Server) {
    const portNum = typeof server === "string"? ns.getServerNumPortsRequired(server) : ns.getServerNumPortsRequired(server.hostname);
    const hostname = typeof server === "string"? server : server.hostname;

    ns.scp(growFile, hostname);
    ns.scp(weakFile, hostname);
    ns.scp(hackFile, hostname);

    if (portNum > 4 && ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(hostname); }
    if (portNum > 3 && ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(hostname); }
    if (portNum > 2 && ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(hostname); }
    if (portNum > 1 && ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(hostname); }
    if (portNum > 0 && ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(hostname); }

    ns.nuke(hostname);  
}

/**
 * Attempts to run a script with multiple threads on multiple servers
 * @remark Ram Cost: 2.1 GB
 * - ns.exec(): 1.3 GB
 * - ns.scp(): 0.6 GB
 * - ns.getScriptRam(): 0.1 GB
 * - ns.getServerMaxRam(): 0.05 GB
 * - ns.getServerUsedRam(): 0.05 GB
 * @param ns - Netscript object
 * @param serverList - list of servers to try to run the script on
 * @param script - script to run
 * @param threads - number of threads to run the script with
 * @param args - arguments to pass to the script
 * @returns pid[] of the script that was run
 */
export function runScript(ns: NS, serverList: string[], script: string, threads: number, ...args: ScriptArg[]): number[] {
    const pids: number[] = [];
    let n = threads;
    
    for (const server of serverList) {
        if (n == 0) {
            break;
        }
        
        const availableRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
        const scriptRam = ns.getScriptRam(script);
        const serverThreads = Math.max(Math.min(Math.floor(availableRam / scriptRam), n), 0);

        if (serverThreads) {
            ns.scp('utils.js', server);
            ns.scp('data.js', server);
            ns.scp(script, server);

            const pid = ns.exec(script, server, serverThreads, ...args);

            if (pid) {
                pids.push(pid);
            }
        }

        n -= serverThreads;
    }

    if (n > 0) {
        ns.print(`Warn: Not enough servers available to run ${script} with ${threads} threads.`);
        ns.print(`${threads - n} threads were run.`);
        ns.ui.openTail();
    }

    return pids;
}