import { NS, Server } from "@ns";

const growFile = "grow.js";
const weakFile = "weak.js";
const hackFile = "hack.js";

export interface Process {
    pid:number,
    threads:number,
    file:string,
    startTime:number,
    completeTime:number,
    target?:string;
}

export interface BatchThreads {
    hostname:string,
    hackThreads:number,
    growThreads:number,
    hackWeakThreads:number,
    growWeakThreads:number;
}

export interface Batch {
    Hostname:string,
    hack:Process,
    hackWeak:Process,
    grow:Process,
    growWeak:Process;
}

export function countThreads(ns: NS, hostname:string, file:string):number { 
    return ns.getServerMaxRam(hostname) ? Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(file, hostname)): 0; 
}

export function countTotalThreads(ns: NS, servers:string[], file:string) {
    let ret = 0;
    for (const serv of servers) {
        ret = ret + countThreads(ns, serv, file);
    }
    return ret;
}


export function getServerList(ns:NS, all:boolean = false): Array<string> {

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


    // create return variable ret and add purchased servers and servers with 0 port.
    let ret: Array<string> = ns.getPurchasedServers().concat(servers0Port);

    // checks if have port openning file on home. Adds servers that can be accessed.
    if (ns.fileExists("BruteSSH.exe") || all) { ret = ret.concat(servers1Port); }
    if (ns.fileExists("FTPCrack.exe") || all) { ret = ret.concat(servers2Port); }
    if (ns.fileExists("relaySMTP.exe") || all) { ret = ret.concat(servers3Port); }
    if (ns.fileExists("HTTPWorm.exe") || all) { ret = ret.concat(servers4Port); }
    if (ns.fileExists("SQLInject.exe") || all) { ret = ret.concat(servers5Port); }
    
    // Return list with home computer at end.
    return ret.concat(["home"]);
  
}

export function crackServer(ns:NS, server:string | Server) {
    
    let portNum = 0;
    let hostname = "";

    if (typeof server === "string") {
        portNum = ns.getServerNumPortsRequired(server);
        hostname = server;
    } else {
        portNum = ns.getServerNumPortsRequired(server.hostname);
        hostname = server.hostname;
    }

    ns.scp("grow.js", hostname);
    ns.scp("hack.js", hostname);
    ns.scp("weak.js", hostname);

    if (portNum > 4 && ns.fileExists("SQLInject.exe")) { ns.sqlinject(hostname); }
    if (portNum > 3 && ns.fileExists("HTTPWorm.exe")) { ns.httpworm(hostname); }
    if (portNum > 2 && ns.fileExists("relaySMTP.exe")) { ns.relaysmtp(hostname); }
    if (portNum > 1 && ns.fileExists("FTPCrack.exe")) { ns.ftpcrack(hostname); }
    if (portNum > 0 && ns.fileExists("BruteSSH.exe")) { ns.brutessh(hostname); }

    ns.nuke(hostname);  
}

export function createUI(data:string | Array<string>, width:number, thickness:number = 1, outlinePattern: string = "#"):string {

    let ui = outlinePattern.repeat(Math.max(Math.ceil(width/outlinePattern.length), 0)).substring(0,width) + "\n";

    if (typeof data === "string") {
      ui = ui + outlinePattern.repeat(Math.max(Math.ceil(thickness/outlinePattern.length), 0)).substring(0,thickness) + " ".repeat(Math.max(Math.floor((width-(2*thickness)-data.length)/2), 0)) + 
        data + " ".repeat(Math.max(Math.ceil((width-(2*thickness)-data.length)/2), 0)) + outlinePattern.repeat(Math.max(Math.ceil(thickness/outlinePattern.length),0)).substring(0,thickness) + "\n";
    } else {
      for (const d of data) {
        ui = ui + outlinePattern.repeat(Math.max(Math.ceil(thickness/outlinePattern.length), 0)).substring(0,thickness) + " ".repeat(Math.max(Math.floor((width-(2*thickness)-d.length)/2), 0)) + 
        d + " ".repeat(Math.max(Math.ceil((width-(2*thickness)-d.length)/2), 0)) + outlinePattern.repeat(Math.max(Math.ceil(thickness/outlinePattern.length),0)).substring(0,thickness) + "\n";
      }
    }

    return ui + outlinePattern.repeat(Math.ceil(width/outlinePattern.length)).substring(0,width) + "\n";

}

export function getServerData(ns:NS, servers:Server[]):Array<string> {
    
    let serverData:Array<string> = [];

    for (const server of servers) {
      const hostname = server.hostname;
      const maxMoney = server.moneyMax ?? 0;
      const avialMoney = server.moneyAvailable ?? 0;

      const left = `{ ${"$".repeat(Math.floor(avialMoney/maxMoney*10))}${"0".repeat(10-Math.floor(avialMoney/maxMoney*10))} } | ${hostname} | ${Math.round((server.hackDifficulty ?? 0) - (server.minDifficulty ?? 0))}`;
      const right = `${ns.formatNumber(avialMoney)} / ${ns.formatNumber(maxMoney)}`;
      serverData.push(left + " ".repeat(Math.max(56-left.length-right.length, 0)) + right);
    }

    return serverData;
  }

export async function displayUI(ns: NS, sleepLength:number, text:string) {
    ns.disableLog("sleep");
    ns.clearLog();
    if (!(ns.getRunningScript()?.tailProperties)) {
        ns.tail();
    }
    if (text) {
        ns.print(text);
    }
    await ns.sleep(sleepLength);
    ns.enableLog("sleep");
}

export async function runScript(ns: NS, servers:string[] ,file:string, threads:number, arg?:string|number|boolean): Promise<Process[]> {

    for (const hostname of servers) {
        ns.scp(file, hostname);
    }
    let i = 0;
    threads = Math.ceil(threads);
    const processes: Array<Process> = []

    while (i < threads) {

        for (const hostname of servers) {

            const serverThreads = ns.getServerMaxRam(hostname) ? Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname)) / ns.getScriptRam(file, hostname)): 0;
            const processThreads = Math.min(serverThreads, threads-i)

            if (serverThreads > 0) {
                const pid = arg ? ns.exec(file, hostname, processThreads, arg) : ns.exec(file, hostname, processThreads);
                const timestamp = Date.now();
                let cTime = timestamp;
                if (threads > 0) {
                    switch(file) {
                        case growFile:
                            cTime = timestamp + (ns.getGrowTime(arg as string) ?? 0);
                            break;
                        case hackFile:
                            cTime = timestamp + (ns.getHackTime(arg as string) ?? 0);
                            break;
                        case weakFile:
                            cTime = timestamp + (ns.getWeakenTime(arg as string) ?? 0);
                            break;
                    }
                }

                const process:Process = {pid:pid, threads:processThreads, file:file, startTime:timestamp, completeTime:cTime, target:arg as string};
             
                processes.push(process);
                i = i + serverThreads;
                if (threads-i < 1) { break; }
            }

        }
        if (threads-i < 1) { break; }
        ns.clearLog()
        ns.print(`Running file ${file}. Waiting for ${threads-i} threads`)
        await ns.sleep(10);
    }

    return processes;
}



export function createGrowProcess(threads:number, startTime:number, completeTime:number, target:string) {
    return {pid:-1, threads:threads, file:growFile, startTime:startTime, completeTime:completeTime, target:target};
}

export function createHackProcess(threads:number, startTime:number, completeTime:number, target:string) {
    return {pid:-1, threads:threads, file:hackFile, startTime:startTime, completeTime:completeTime, target:target};
}

export function createWeakProcess(threads:number, startTime:number, completeTime:number, target:string) {
    return {pid:-1, threads:threads, file:weakFile, startTime:startTime, completeTime:completeTime, target:target};
}