import { Process, countTotalThreads, getServerList, runScript } from "../functions";
import { NS } from "@ns";

export class processList {
    public processes:Array<Process> = [];
    private _timestamp:number = 0;

    constructor(time:number) {
        this.time = time;
    }

    public push(process:Process | Process[]) {
        if (process instanceof Array) {
            for (const p of process) {
                this.processes.push(p);
            }
        } else {
            this.processes.push(process);
        }
        this.processes = this.processes.sort((n1,n2) => n1.completeTime - n2.completeTime);
    }

    public get time() {
        return this._timestamp;
    }

    public set time(timestamp:number) {
        this.processes = this.processes.filter((process) => process.completeTime > timestamp);
        this._timestamp = timestamp
    }

    public getLastProcess(target:string) {
        return this.processes.findLast((process:Process) => process.target == target);
    }

    public async startProcess(ns:NS, servers:Array<string>) {

        for (const p of this.processes.filter((process) => process.startTime < this.time && process.pid < 0)) {
            const index = this.processes.indexOf(p);
            this.processes = this.processes.slice(0,index).concat(this.processes.slice(index+1,this.processes.length))
            this.push(await runScript(ns, servers, p.file, p.threads, p.target));
        }
    }

    public getThreadsAt(ns:NS, time:number):number {
        return countTotalThreads(ns, getServerList(ns), "grow.js") - this.processes.filter((process) => process.completeTime > time && process.startTime > this.time).reduce((ac, cVal) => ac + cVal.threads,0)
    }


}