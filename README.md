## Overview

MCP Server that provides informtion about [Fly.io `.internal` DNS](https://fly.io/docs/networking/private-networking/#fly-io-internal-dns) for an organization.

## Usage

```
fly mcp launch "npx -y @flydotio/mcp-internal-dns" --claude --server dns
```

If you want to query an organization other than your _personal_ one, specify the `--org` flag on the above command.

## Development