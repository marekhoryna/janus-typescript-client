# Janus Typescript Client

Wrapper with library and typescript definitions for Janus Gateway Client.

## Installation

`npm intall --save-dev janus-typescript-client`
\
\
`yarn add -D janus-typescript-client`

## Usage

```
import * as Janus from 'janus-typescript-client';

Janus.init({
    callback: () => {
        const janus = new Janus(...options);
    },
});
```
