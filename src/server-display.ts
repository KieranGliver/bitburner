import { NS } from "@ns";
import { displayUI, getServerList, createUI, getServerData } from "./functions";

export async function main(ns: NS): Promise<void> {

  const isHackable = (host: string) => ns.getServerRequiredHackingLevel(host) <= ns.getHackingLevel() && ns.getServerMaxMoney(host) > 0 && ns.getServer(host).hasAdminRights

  let p = 0;
  let servers : Array<string>;
  ns.exec("crack.js","home",)
  
  while (true) {
    
    servers = getServerList(ns);
    const n = checkExeFiles()

    // if number of openable ports is not what we recorded crack all servers we can;
    if (n != p) {
      ns.exec("crack.js","home",)
    }

    const header = createUI("Server Display",60, 5)

    //const serverUI = createUI(getServerData(ns, servers.filter(isHackable).map((hostname) => ns.getServer(hostname))), 60, 1, "~");
    const serverUI = createUI(getServerData(ns, servers.map((hostname) => ns.getServer(hostname))), 60, 1, "~");

    const ram = ns.formatRam(servers.reduce((ac,cVal) => ac + ns.getServerUsedRam(cVal),0)) + " / " + ns.formatRam(servers.reduce((ac,cVal) => ac + ns.getServerMaxRam(cVal),0));
    const footer = createUI(ram, 60, 5);

    await displayUI(ns, 10, header +  serverUI + footer);
  }

  function checkExeFiles():number {
    let n = 0
    const exeFiles = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];

    for (const exe of exeFiles) {
      if (ns.fileExists(exe)) {
        n = n + 1;
      }
    }

    return n;
  }
  
}