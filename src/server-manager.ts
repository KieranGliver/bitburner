import { NS } from "@ns";

const liquid : number = 0.7

export async function main(ns: NS): Promise<void> {
  
  ns.tail();
  ns.disableLog("sleep");
  ns.disableLog("getServerMaxRam");
  ns.clearLog();

  function findMinRam(servers: Array<string>) {
    let min = 1048576
    for (const serv of servers) {
      min = Math.min(min, ns.getServerMaxRam(serv));
    }
    return min;
  }

  function findMaxPurchase() {
    let max = 2;
    while (max < 1048576 && ns.getPurchasedServerCost(max*2) < ns.getPlayer().money * liquid) {
      max = max * 2;
    }
    return max;
  }

  function findMaxUpgrade(serv: string) {
    let max = ns.getServerMaxRam(serv);
    while (max < 1048576 && ns.getPurchasedServerUpgradeCost(serv, max*2) < ns.getPlayer().money * liquid) {
      max = max * 2;
    }
    return max;
  }

  function isMaxed(servers: Array<string>):boolean {
    if (servers.length < 1) { return false }
    for (const serv of servers) {
      if (ns.getServerMaxRam(serv) != 1048576) {
        return false;
      }
    }
    return true;
  }


  let servers = ns.getPurchasedServers();
  let log = "Hello!"

  while (!isMaxed(servers)) {
    servers = ns.getPurchasedServers();

    if (servers.length < ns.getPurchasedServerLimit()) {
      const maxPurchase = findMaxPurchase();
      let serv = ns.purchaseServer(`pserv-${servers.length}`, maxPurchase);
      log = `Bought server with ${maxPurchase} ram named ${serv}`
    } else {
      const min = findMinRam(servers);
      const minServ = servers.find((serv) => ns.getServerMaxRam(serv) == min)
      if (minServ && findMaxUpgrade(minServ) > min) {
        const maxUpgrade = findMaxUpgrade(minServ);
        ns.upgradePurchasedServer(minServ, maxUpgrade)
        log = `Upgraded server with ${ns.formatRam(min)} to ${ns.formatRam(maxUpgrade)} named ${minServ}`
      }
    }

    ns.clearLog()
    ns.print(`~~~~~~~~~~~~~~~~~~~~ ServerList ~~~~~~~~~~~~~~~~~~~~`)
    ns.print(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    for (const serv of servers) {
      ns.print(`Server Name: ${serv}, Ram: ${ns.getServerMaxRam(serv)}`)
    }
    ns.print(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    ns.print(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    ns.print(log);

    await ns.sleep(100);
  }

  ns.toast("You Maxed out servers!");
  ns.closeTail();
}