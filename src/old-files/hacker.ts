import { NS } from "@ns";
import { getServerList, countTotalThreads, createGrowProcess, createWeakProcess, createHackProcess, BatchThreads } from "./functions";
import { processList } from "./process-list";

export async function main(ns: NS): Promise<void> {
    ns.tail();
    const isHackable = (host: string) => ns.getServerRequiredHackingLevel(host) <= ns.getHackingLevel() && ns.getServerMaxMoney(host) > 0 && ns.getServer(host).hasAdminRights

    function threadsToMaxMoney(target: string, moneyAvailable:number): number {
  
        const max = ns.getServerMaxMoney(target);
        const avail = Math.max(moneyAvailable,1);
    
        const multi = max/avail;
        
        return Math.ceil(ns.growthAnalyze(target,multi));
    
    }

    function threadsToHackMoney(target: string, p: number): number {
  
        const max = ns.getServerMaxMoney(target);
        const avail = ns.getServerMoneyAvailable(target);
    
        const money = (avail/max - p) * max;
    
        if (money > 0) {
          return Math.ceil(ns.hackAnalyzeThreads(target, money)/ns.hackAnalyzeChance(target));
        }

        return 0;
    
    }

    

    const pList = new processList(Date.now());
    const hackP = 0.25;
    const interval = 100;
    const batchList = new Array<BatchThreads>;
    const wait = new Array<{hostname:String, weakTime:number, growTime:number, hackTime:number}>;
    const status = new Array<{hostname:string, ready:boolean}>;

    function launchBatch(bIndex: number, wIndex: number, target:string, grow:boolean = true) {
        const checkHack = batchList[bIndex].hackThreads <= pList.getThreadsAt(ns, pList.time + wait[wIndex].weakTime - wait[wIndex].hackTime);
        const checkHackWeak = batchList[bIndex].hackWeakThreads <= pList.getThreadsAt(ns, pList.time);
        const checkGrow = batchList[bIndex].growThreads <= pList.getThreadsAt(ns, pList.time + interval + wait[wIndex].weakTime - wait[wIndex].growTime)
        const checkGrowWeak = batchList[bIndex].growWeakThreads <= pList.getThreadsAt(ns, pList.time + interval);
        if (checkHack && checkHackWeak) {
            if (grow && checkGrow && checkGrowWeak) {
                pList.push(createHackProcess(batchList[bIndex].hackThreads, pList.time + wait[wIndex].weakTime - wait[wIndex].hackTime, pList.time + wait[wIndex].weakTime, target));
                pList.push(createWeakProcess(batchList[bIndex].hackWeakThreads, pList.time + interval/2, pList.time + wait[wIndex].weakTime + interval/2, target)); 
                pList.push(createGrowProcess(batchList[bIndex].growThreads, pList.time + interval + wait[wIndex].weakTime - wait[wIndex].growTime, pList.time + wait[wIndex].weakTime + interval, target));
                pList.push(createWeakProcess(batchList[bIndex].growWeakThreads, pList.time + interval * 3/2, pList.time + wait[wIndex].weakTime + interval * 3/2, target));
            } else if (!grow) {
                pList.push(createHackProcess(batchList[bIndex].hackThreads, pList.time + wait[wIndex].weakTime - wait[wIndex].hackTime, pList.time + wait[wIndex].weakTime, target));
                pList.push(createWeakProcess(batchList[bIndex].hackWeakThreads, pList.time + interval/2, pList.time + wait[wIndex].weakTime + interval/2, target));
            }
        }
    }

    for (const server of getServerList(ns, true)) {
        batchList.push({hostname:server, growThreads:0, hackThreads:0, growWeakThreads: 0, hackWeakThreads:0})
        wait.push({hostname:server, weakTime:ns.getWeakenTime(server), growTime:ns.getGrowTime(server), hackTime:ns.getHackTime(server)})
        status.push({hostname:server, ready:false})
    }

    while (true) {
        const servers = getServerList(ns);
        const targets = servers.filter(isHackable);
        //const targets = ["iron-gym"];
        
        for (const target of targets) {
            
            pList.time = Date.now();
            await pList.startProcess(ns, servers);
            //ns.tprint("running processes")

            const targetServer = ns.getServer(target);
            const batchindex = batchList.findIndex((batch) => batch.hostname == target);
            const waitIndex = wait.findIndex((wait) => wait.hostname == target);
            const lastProcess = pList.getLastProcess(target);
            const statusIndex = status.findIndex((status) => status.hostname == target);

            


            
            if (targetServer) {
                const hackDifficulty = targetServer.hackDifficulty as number
                const minDifficulty = targetServer.minDifficulty as number
                const moneyAvailable = targetServer.moneyAvailable as number
                const moneyMax = targetServer.moneyMax as number

                batchList[batchindex].growThreads = threadsToMaxMoney(target, moneyMax * 0.10);

                if (moneyAvailable / moneyMax < hackP) {
                    batchList[batchindex].growWeakThreads = Math.max(batchList[batchindex].growWeakThreads, Math.ceil(ns.growthAnalyzeSecurity(batchList[batchindex].growThreads, target)*2/0.05));
                }

                if (!(lastProcess) && batchList[batchindex].growWeakThreads > 0) {
                    status[statusIndex].ready = true;
                }

                if (!(hackDifficulty - minDifficulty > 0 )) {
                    wait[waitIndex].growTime = ns.getGrowTime(target);
                    wait[waitIndex].hackTime = ns.getHackTime(target);
                    wait[waitIndex].weakTime = ns.getWeakenTime(target);
                }


                if (!(lastProcess) && ((hackDifficulty - minDifficulty > 0 || moneyAvailable / moneyMax < 0.8))) {
                    
                    
                    const growThreads = threadsToMaxMoney(target, ns.getServerMoneyAvailable(target));
                    const weakThreads = Math.ceil(((targetServer.hackDifficulty as number) - (targetServer.minDifficulty as number))/0.05) + Math.ceil(ns.growthAnalyzeSecurity(growThreads, target)/0.05);

                    if (weakThreads + growThreads <= pList.getThreadsAt(ns,pList.time)) {
                        //ns.tprint(`Launch weak batch with ${growThreads} growth and ${weakThreads} weak`)
                        pList.push(createGrowProcess(growThreads, pList.time, pList.time + ns.getGrowTime(target), target));
                        pList.push(createWeakProcess(weakThreads, pList.time, pList.time + ns.getWeakenTime(target), target));
                    }
                }
                if (!((hackDifficulty - minDifficulty > 0 || moneyAvailable / moneyMax < 0.8))) {
                    if (moneyAvailable / moneyMax > 0.8) {
                        batchList[batchindex].hackThreads = Math.ceil(ns.hackAnalyzeThreads(target, moneyMax*hackP)/ns.hackAnalyzeChance(target))
                    }
                    batchList[batchindex].hackWeakThreads = Math.ceil(ns.hackAnalyzeSecurity(batchList[batchindex].hackThreads, target)/0.05);
                    
                    if (!(lastProcess)) {
                        launchBatch(batchindex, waitIndex, target, status[statusIndex].ready?true:false);
                    }
                }
                
                
                if (lastProcess && lastProcess.completeTime < pList.time + wait[waitIndex].weakTime && batchList[batchindex].growWeakThreads > 0 && !(hackDifficulty - minDifficulty > 0) && status[statusIndex].ready) {
                    //ns.tprint("here")
                    launchBatch(batchindex, waitIndex, target);
                }
                
                
                    
            }
        }

        await ns.sleep(10);

    }
}
