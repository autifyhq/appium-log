# Minmal starter for React with Deno

This project is a minmal starter template to compile React JSX (`.tsx`) files into a bundled JavaScript file using Deno.

You don't need Node.js or `npm install` command to compile them, but just [Deno](https://deno.land/) is required.

The `deno bundle` command enables you to use Deno as a bundler for client side JavaScript.

Deno from 1.16 supports JSX, which means you can bundle `.jsx` and `.tsx` files. This project is an example for Deno's compilation of React projects.

## Development

requirements

- Deno
- denon https://deno.land/x/denon

Build a bundle file with watching.

```
denon watch
```

Start a static server.

```sh
deno run --allow-net --allow-read https://deno.land/std@0.122.0/http/file_server.ts public/
```
