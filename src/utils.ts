import { NS, ScriptArg } from "@ns";

/**
 * Returns a list of servers the player can access based on available port opening programs.
 * @remark Ram Cost: 1.15 GB
 * - ns.getPurchasedServers()
 * - ns.fileExists()
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
 * attempt to run script on first server with enough ram
 * @remark Ram Cost: 2.1 GB
 * - ns.getScriptRam()
 * - ns.getServerMaxRam()
 * - ns.getServerUsedRam()
 * - ns.scp()
 * - ns.exec()
 * @param ns - Netscript object
 * @param serverList - list of servers to try to run the script on
 * @param script - script to run
 * @param threads - number of threads to run the script with
 * @param args - arguments to pass to the script
 * @returns pid of the script that was run, or 0 if no script was run
 */
export function runScript(ns: NS, serverList: string[], script: string, threads: number = 1, ...args: ScriptArg[]): number {
    for (const server of serverList) {
        if (ns.getScriptRam(script) * threads <= ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) {
            // Need to copy the script and import modules to the server
            ns.scp('utils.js', server);
            ns.scp('data.js', server);
            ns.scp(script, server);

            return ns.exec(script, server, threads, ...args);
        }
    }
    ns.print(`No server available to run ${script}.`);
    ns.ui.openTail();
    return 0;
}