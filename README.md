# Janus Typescript Client

Wrapper with library and typescript definitions for Janus Gateway Client.

## Installation

`npm intall janus-typescript-client`
\
\
`yarn add janus-typescript-client`

## Usage

```
import * as Janus from 'janus-typescript-client';

Janus.init({
    callback: () => {
        const janus = new Janus(...options);
    },
});
```
