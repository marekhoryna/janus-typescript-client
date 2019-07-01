# Janus Typescript Client

Wrapper with library and typescript definitions for Janus Gateway Client.

## Installation

`yarn add https://github.com/kow33/janus-typescript-client`

## Usage

```
import * as Janus from 'janus-typescript-client;

Janus.init({
    callback: () => {
        const janus = new Janus(...options);
    },
});
```
