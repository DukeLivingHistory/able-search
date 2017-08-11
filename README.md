# Able-Timestamps

able-timestamps is an extension for [Able Player](https://github.com/able-player/able-player) that adds chapter-based indicator dots to the seekbar that can be used to navigate the video. The dots can be provided in the form of a specific WebVTT chapter file, as titles in a WebVTT caption file, or as an array of text/timestamp pairs.

## Usage

_(Refer to `demo/index.html` for comprehensive examples)_

This script must be included after jQuery and Able Player. It can be called as such:

```
/**
 * {string|object} player       Selector to instantiate a new AblePlayer instance OR an existing AblePlayer object.
 * {string|array}  transcript   WebVTT text OR an array of objects with text and start properties. In the latter case, pass format: 'array' as a property of the opts object.
 * {object}        opts         Options object, optional. See below for more detail.
 */
ableplayerAddDots(player, transcript, [opts])
```

### Options

* **display:** `dot` or `line`. The visual style to be used for markers. Default `line`.
* **color:** Hex code or CSS color alias to be used for markers. Default `'#ffffff'`.
* **width:** Size in pixels to be used for markers. Default `6`.
* **format:** `chapters`, `titles`, or `array`. `chapters` expects chapter headings to be on a new line after timestamps. `titles` expects chapter headings to be on a new line **before** timestamps. `array` expects an array of objects with `text` and `start` properties, as shown below. Default `chapters`.

```
{
  text: 'Chapter Heading',
  start: 10 // timestamp in seconds
}
```

### Callbacks

The function returns a Promise, so it can be used with `.then()` to run a callback upon completion or `.catch()` to handle errors that might be thrown by badly-formatted chapters. The Promise resolves with a `player` argument, so this can be used to chain multiple instances of this function – or any other arbitrary code you need to run.

## License

This project is released under an MIT license.

## Contributing

With Node and npm installed, run `npm install` and `npm run build` to recompile JavaScript. The source code is found in `src` and compiles to `dist`.

Submit contributions to this repository in the form of pull requests.

## Contributors

* [Ethan Butler](https://github.com/ethanbutler)
