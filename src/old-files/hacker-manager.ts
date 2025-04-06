import { NS } from "@ns";
import { countTotalThreads, displayUI, getServerList, runScript } from "./functions";

const growFile = "grow.js";
const weakFile = "weak.js";
const hackFile = "hack.js";

export async function main(ns: NS): Promise<void> {

  
    function threadsToMaxMoney(serv: string): number {
  
        const max = ns.getServerMaxMoney(serv);
        const avail = Math.max(ns.getServerMoneyAvailable(serv),1);
    
        const multi = max/avail;
        
        return Math.ceil(ns.growthAnalyze(serv,multi));
    
    }

    function threadsToHackMoney(serv: string, p: number): number {
  
        const max = ns.getServerMaxMoney(serv);
        const avail = ns.getServerMoneyAvailable(serv);
    
        const money = (avail/max - p) * max;
    
        if (money > 0) {
          return Math.ceil(ns.hackAnalyzeThreads(serv, money)/ns.hackAnalyzeChance(serv));
        }

        return 0;
    
    }

    async function hackServer(servers:string[], target:string, p: number, threads:number) {

        const hackThreads = threadsToHackMoney(target, p);
        const baseWeakenThreads = Math.ceil((ns.getServerSecurityLevel(target)-ns.getServerMinSecurityLevel(target))/0.05)
        const weakenThreads = Math.ceil(ns.hackAnalyzeSecurity(hackThreads, target)/0.05);

        let lastCompleteTime = 0;
        for (const process of await runScript(ns, servers, weakFile, Math.min(threads, baseWeakenThreads), target)) {
            lastCompleteTime = Math.max(lastCompleteTime, process.completeTime)
        }
        for (const process of await runScript(ns, servers, hackFile, Math.min(threads - baseWeakenThreads, hackThreads), target)) {
            lastCompleteTime = Math.max(lastCompleteTime, process.completeTime)
        }
        for (const process of await runScript(ns, servers, weakFile, Math.min(threads - hackThreads - baseWeakenThreads, weakenThreads), target)) {
            lastCompleteTime = Math.max(lastCompleteTime, process.completeTime)
        }
        return lastCompleteTime;
    }

    async function growServer(servers:string[], serv:string, threads:number) {

        const baseWeakenThreads = Math.ceil((ns.getServerSecurityLevel(serv)-ns.getServerMinSecurityLevel(serv))/0.05)

        let lastCompleteTime = 0;
        if (threads > 0) {
            for (const process of await runScript(ns, servers, weakFile, Math.min(threads, baseWeakenThreads), serv)) {
                lastCompleteTime = Math.max(lastCompleteTime, process.completeTime)
            }
        }
        threads =- baseWeakenThreads
        if (threads > 0) {

            const maxGrowThreads = threadsToMaxMoney(serv);
            let growThreads = maxGrowThreads

            let weakenThreads = Math.ceil(ns.growthAnalyzeSecurity(growThreads, serv)/0.05);

            growThreads =  Math.min(threads * growThreads / (growThreads + weakenThreads), growThreads)

            weakenThreads = Math.ceil(ns.growthAnalyzeSecurity(growThreads, serv)/0.05);

            for (const process of await runScript(ns, servers, growFile, Math.min(threads, growThreads), serv)) {
                lastCompleteTime = Math.max(lastCompleteTime, process.completeTime);
            }
            threads =- growThreads

            for (const process of await runScript(ns, servers, weakFile, Math.min(threads, weakenThreads), serv)) {
                lastCompleteTime = Math.max(lastCompleteTime, process.completeTime);
            }
        }

        return lastCompleteTime;
    }

    async function weakenServer(servers:string[], serv:string, threads:number) {
        const weakenThreads = Math.ceil((ns.getServerSecurityLevel(serv)-ns.getServerMinSecurityLevel(serv))/0.05);
        let lastCompleteTime = 0;
        for (const process of await runScript(ns, servers, weakFile, Math.min(threads, weakenThreads), serv)) {
            lastCompleteTime = Math.max(lastCompleteTime, process.completeTime)
        }
        return lastCompleteTime;
    }

    let servers = getServerList(ns);
    let threadsAt = countTotalThreads(ns, servers,"grow.js");
    let timestamp = Date.now();
    let state: "growing" | "hacking" = "growing";
    const target = ns.args[0] as string

    

    let cTime = await weakenServer(servers, target, threadsAt)
    if (cTime > timestamp) {
        timestamp = cTime + 100;
    }

    while (true) {
        const time = Date.now();
        servers = getServerList(ns);

        threadsAt = countTotalThreads(ns, servers,"grow.js");

        const moneyAvailable = ns.getServerMoneyAvailable(target);
        const moneyMax = ns.getServerMaxMoney(target);

        if (time > timestamp) {
            if (state == "growing") {
                if (moneyAvailable/moneyMax > 0.95) {
                    state = "hacking";
                    continue;
                }
                const cTime = await growServer(servers, target, threadsAt)
                if (cTime > timestamp) {
                    timestamp = cTime + 100;
                }

            } else if (state == "hacking") {
                if (moneyAvailable/moneyMax < 0.80) {
                    state = "growing";
                    continue;
                }
                const cTime = await hackServer(servers, target, 0.75, threadsAt)
                if (cTime > timestamp) {
                    timestamp = cTime + 100;
                }
            }
        }

        await displayUI(ns, 100, `| Target : ${target} |\n| Status : ${state} |\n| WaitTime : ${ns.tFormat(timestamp - Date.now())} |\n| threads: ${threadsAt} |\n`)
    }
}
