## Overview

MCP Server that provides information about [Fly.io `.internal` DNS](https://fly.io/docs/networking/private-networking/#fly-io-internal-dns) for an organization.

## Usage

```sh
fly mcp launch "npx -y @flydotio/mcp-internal-dns" --claude --server dns
```

If you want to query an organization other than your _personal_ one, specify the `--org` flag on the above command.

## Development

Launch this initially using:

```sh
fly launch --no-deploy --auto-stop=suspend
```

Generate a secret token using:

```sh
openssl rand -base64 18
```

Set a secret using the token generated above:

```sh
fly secrets set FLY_MCP_BEARER_TOKEN=xxxxxxxxxxxxxxxxxx
```

Now deploy:

```sh
fly deploy --ha=false
```

Configure your favorite MCP client:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "/Users/rubys/.fly/bin/flyctl",
      "args": [
         "mcp",
         "proxy",
         "--url=https://mcp-internal-dns.fly.dev/",
         "--bearer-token",
         "xxxxxxxxxxxxxxxxxx"
       ]
    }
  }
}
```

Replace the command, url and bearer token in the above.

