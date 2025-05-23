// https://fly.io/docs/networking/private-networking/

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { resolveTxt, resolve6 } from "node:dns";

const server = new McpServer({
  name: "Fly.io private network",
  version: "0.0.1"
});

// Extract AAAA records from the DNS and return them as a list of text records
function AAAARecords(name: string) : Promise<{ content: { type: "text"; text: string }[] }> {
  return new Promise((resolve, reject) => {
    resolve6(name, (err, addresses) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          content: addresses.flat().map(addr => ({
            type: "text",
            text: addr
          }))
        })      
      }
    })
  })
}

// Extract TXT records from the DNS and return them as a list of text records
// Extract TXT records from the DNS and return them as a list of text records
function TXTRecords(
  name: string,
  mapper: (txt: string) => Array<string>
): Promise<{ content: { type: "text"; text: string }[] }> {
  return new Promise((resolve, reject) => {
    resolveTxt(name, (err, records) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          content: mapper(records.flat().join("")).map(txt => ({
            type: "text",
            text: txt
          }))
        })
      }
    })
  })
}

// Define the tools
server.tool(
  "get6pnAddresses",
  "6PN addresses of all Machines in any region for the app",
  { 
    appName: z.string().describe("The name of the app")
  },
  async ({ appName }) => AAAARecords(`${appName}.internal`)
);

server.tool(
  "getNearestAddresses",
  "6PN addresses of top number closest Machines for the app",
  {
    number: z.number().describe("The number of addresses to return"), 
    appName: z.string().describe("The name of the app")
  },
  async ({ number, appName }) => AAAARecords(`top${number}.nearest.of.${appName}.internal`)
);

server.tool(
  "getMachineAddress",
  "address of a specific Machine for the app",
  {
    machineId: z.string().describe("The machine ID"),
    appName: z.string().describe("The name of the app")
  },
  async ({ machineId, appName}) => AAAARecords(`${machineId}.vm.${appName}.internal`)
);

server.tool(
  "getMachineRegions",
  "Machine ID and regions name for the app",
  { 
    appName: z.string().describe("The name of the app")
  },
  async ({ appName }) => TXTRecords(
    `vms.${appName}.internal`,
    records => records.split(",").map(machineRegion => {
      const [machineId, region] = machineRegion.split(" ");
      return JSON.stringify({machineId, region});
    })
  )
);

server.tool(
  "getProcessGroupAddresses",
  "6PN addresses of Machines in process group for the app",
  {
    processGroup: z.string().describe("The process group name"),
    appName: z.string().describe("The name of the app")
  },
  async ({ processGroup, appName }) => AAAARecords(`${processGroup}.process.${appName}.internal`)
);

server.tool(
  "getRegionNames",
  "region names where Machines are deployed for app",
  {
    appName: z.string().describe("The name of the app")
  },
  async ({ appName}) => TXTRecords(
    `regions.${appName}.internal`,
    records => records.split(",")
  )
);

server.tool(
  "get6pnAddressesByMetadata",
  "6PN addresses of all Machines in any region for the app",
  {
    key: z.string().describe("The metadata key"),
    value: z.string().describe("The metadata value"),
    appName: z.string().describe("The name of the app")
  },
  async ({ key, value, appName }) => AAAARecords(`${value}.${key}.kv._metadata.${appName}.internal`)
);

server.tool(
  "getApps",
  "names of all apps in current organization",
  {  },
  async ({ }) => TXTRecords(
    `_apps.internal`,
    records => records.split(",")
  )
);

server.tool(
  "getPeers",
  "names of all WireGuard peers in current organization",
  {  },
  async ({ }) => TXTRecords(
    `_peer.internal`,
    records => records.split(",")
  )
);

server.tool(
  "6pnAddressesOfPeer",
  "6PN address of peer",
  {
    peerName: z.string().describe("The name of the peer"),
  },
  async ({ peerName }) => AAAARecords(`${peerName}._peer.internal`)
);

server.tool(
  "getInstances",
  "Machine ID, app name, 6PN address, and region for all Machines in current organization",
  { },
    async ({ }) => TXTRecords(
    `_instances.internal`,
    records => records.split(";").map(record => (
      JSON.stringify(Object.fromEntries(record.split(",").map(item => item.split("="))))
    ))
  )
);

// Start the server
const transport = new StdioServerTransport();
console.error("Starting stdio server...");
await server.connect(transport);
