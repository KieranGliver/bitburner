import { NS } from "@ns";

const liquid : number = 0.7
const maxRam : number = 1048576
const minRam : number = 2

export async function main(ns: NS): Promise<void> {
  
  // Set up logging and disable unnecessary logs
  ns.ui.openTail();
  ns.disableLog("sleep");
  ns.disableLog("getServerMaxRam");
  ns.clearLog();

  function findMinRam(servers: string[]) {
    let min = maxRam
    for (const hostname of servers) {
      min = Math.min(min, ns.getServerMaxRam(hostname));
    }
    return min;
  }

  function findMaxPurchase() {
    let max = minRam;
    const liquidMoney = ns.getPlayer().money * liquid;
    while (max < maxRam && ns.getPurchasedServerCost(max*2) < liquidMoney) {
      max = max * 2;
    }
    return max;
  }

  function findMaxUpgrade(serv: string) {
    let max = ns.getServerMaxRam(serv);
    const liquidMoney = ns.getPlayer().money * liquid;
    while (max < maxRam && ns.getPurchasedServerUpgradeCost(serv, max*2) < liquidMoney) {
      max = max * 2;
    }
    return max;
  }

  function isMaxed(servers: Array<string>):boolean {
    if (servers.length < 1) { return false }
    for (const hostname of servers) {
      if (ns.getServerMaxRam(hostname) != maxRam) {
        return false;
      }
    }
    return true;
  }

  function updateDisplay(servers: string[], log: string) {
    ns.clearLog()
    ns.print(`~~~~~~~~~~~~~~~~~~~ Server List ~~~~~~~~~~~~~~~~~~~`)
    ns.print(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    for (const hostname of servers) {
      ns.print(`Server Name: ${hostname}, Ram: ${ns.getServerMaxRam(hostname)}`)
    }
    ns.print(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    ns.print(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    ns.print(log);
  }


  let servers: string[] = ns.getPurchasedServers();
  let log = "Hello!"

  while (!isMaxed(servers)) {
    servers = ns.getPurchasedServers();

    if (servers.length < ns.getPurchasedServerLimit()) {
      const maxPurchase = findMaxPurchase();
      const hostname = ns.purchaseServer(`pserv-${servers.length}`, maxPurchase);
      log = `Bought server with ${maxPurchase} ram named ${hostname}`
    } else {
      const min = findMinRam(servers);
      const minServer = servers.find((serv) => ns.getServerMaxRam(serv) == min)
      if (minServer && findMaxUpgrade(minServer) > min) {
        const maxUpgrade = findMaxUpgrade(minServer);
        ns.upgradePurchasedServer(minServer, maxUpgrade)
        log = `Upgraded server with ${ns.formatRam(min)} to ${ns.formatRam(maxUpgrade)} named ${minServer}`
      }
    }

    updateDisplay(servers, log);

    await ns.sleep(100);
  }

  ns.toast("You Maxed out servers!");
  ns.ui.closeTail();
}