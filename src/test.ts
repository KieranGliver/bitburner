import { NS } from "@ns";
import { countTotalThreads, displayUI, getServerList, runScript } from "./functions";

export async function main(ns: NS): Promise<void> {
    const servers = getServerList(ns);
    await runScript(ns, servers, "grow.js", 10, ns.args[0])
}
