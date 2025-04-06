import { NS } from "@ns";

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

    ret.push("home");
    ret.push(...ns.getPurchasedServers().concat(servers0Port));

    // checks if have port openning file on home. Adds servers that can be accessed.
    if (ns.fileExists("BruteSSH.exe") || allFlag) { ret.push(...servers1Port); }
    if (ns.fileExists("FTPCrack.exe") || allFlag) { ret.push(...servers2Port); }
    if (ns.fileExists("relaySMTP.exe") || allFlag) { ret.push(...servers3Port); }
    if (ns.fileExists("HTTPWorm.exe") || allFlag) { ret.push(...servers4Port); }
    if (ns.fileExists("SQLInject.exe") || allFlag) { ret.push(...servers5Port); }
    
    // Return list with home computer at end.
    return ret;
  
}