# Demos for GenDev in one repo

I will try to put everything here, but no promises (that is a pun).

If you wanna study some questinable code, some of my old projects can be found here:

- [ringavirda/fallen-cli: There are too many features for a console app.](https://github.com/ringavirda/fallen-cli)
- [ringavirda/math-phrase: Solve primary school math like a pro-programmer.](https://github.com/ringavirda/math-phrase)
- [ringavirda/simple-website: The simpler the better.](https://github.com/ringavirda/simple-website)

Go and have some fun! (That's an order from Fallenstar)

## @demo/nodo Basic demonstration of how to write node console app

There are several implementation of the same logic utilizing different API and styles in this demo. Javascript implementations contain:

- eventIO – the original way using `process` and event handlers.
- readline – the same thing only with I/O streams being wrapped into standard `readline` interface. More "Imperative" approach.
- crud – basic application with the capabilities of store and mutate date in JSON format. Due to conflicts between different ANSI injectors (chalk and readonly) it is quite buggy.

To rectify the issue with Javascript implementations a Typescript version was added. To spice things app it also uses standard model-service architecture, and due to this uses dependency injection container. For some reason, even though this one is more complex, it works fine for some reason.

To run both examples you can use the following commands (any package manager works, not only yarn):

```powershell
cd packages/node
yarn start-js # for javascript examples, to switch implementation change app.js file.

yarn build # we need to compile ts first.
yarn start-ts # for the typescript part.
```

The typescript part can be watched and served if needed.

## @demo/types

We use Typescript a lot, so there was a need for a demo of how to write code in it. I wouldn't call this the best demonstration of typescript or coding in general, but there are some useful hints about how to do stuff with types, generics and decorators. Make good use of it, since there aren't really a lot of examples about this out there.

This is a single application that runs all the examples in _"Example"_ classes. To control execution try using the `exampleRun` decorator. It runs everything by default.

To start this demo you need to do the following:

```powershell
cd packages/types

yarn build # since this is typescript.
yarn start
```

You can serve it as well, if you need live dev environment.

## @wp: waifu-picker

This is a git submodule pointing to the original repo: [ringavirda/waifu-picker: Select your waifu with style!](https://github.com/ringavirda/waifu-picker)
