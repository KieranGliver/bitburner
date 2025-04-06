import { NS, Server } from "@ns";

class ServerNode {

  children: ServerNode[] = new Array<ServerNode>;

  constructor(
    public server: Server,
    public parent: ServerNode | undefined = undefined
  ) {parent?.children.push(this);}
}

export async function main(ns: NS): Promise<void> {
  ns.disableLog("scan");
  ns.clearLog();
  
  if (ns.args.length != 1) {
    ns.print(`ERROR: ${ns.args.length} arguments given. Requires 1 (hostname)`);
    ns.tail();
    ns.exit();
  }
  

  const homeServer = new ServerNode(ns.getServer("home"));
  let queue = new Array<ServerNode>;
  let visited = new Array<string>;

  let ret = new Array<string>;

  queue.push(homeServer);
  visited.push("home");

  while (queue.length > 0)
  {
    const u = queue.pop()

    for (const serv of ns.scan(u?.server.hostname))
    {
      if (!(visited.find((s) => s == serv))) {
        const n = new ServerNode(ns.getServer(serv), u);
        
        //if ((n.server.numOpenPortsRequired && n.server.numOpenPortsRequired == ns.args[0]) || (!(n.server.numOpenPortsRequired) && ns.args[0] == 0)) {
        //  ret.push(serv);
        //}

        
        if (serv == ns.args[0]) {

          let cur = n;
          let ret = `connect ${serv}; `;

          while (cur.parent) {
            ret = `connect ${cur.parent.server.hostname}; ` + ret;
            cur = cur.parent;
          }

          ns.tprint(ret);
          ns.exit();
        }
        

        queue.push(n);
        visited.push(serv);

      }
    }
  }


  ns.tail();

  /*
  let log = ""
  for (const s of ret) {
    log = `${log}, "${s}"`
  }
  log = log.substring(2)
  ns.print(log);
  */

  ns.print(`Could not find ${ns.args[0]}`);
  

}
