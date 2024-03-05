# visitData

visitData emulates the source, medium, campaign, content and term data just like Google Analytics does it (ga.js).

Since there is no way to extract this information from ga.js directly, you need a library like visitdata.js to do it.

## Questions / Contact

If you have any questions for this, drop me an email at [ilkkapel@gmail.com](mailto:ilkkapel@gmail.com)

## Include from cdn

Here's the file you can include in your web page directly from CDN:
https://cdn.jsdelivr.net/npm/visitdata/dist/visitdata.umd.js

## Install with npm

```
npm install visitdata
```

## Build from source code

clone this repository and then

```sh
npm install
npm run build
```

the javascript you need is at dist/visitdata.js

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/visitdata/dist/visitdata.umd.js"></script>
<script>console.log(visitData.get());</script>
```

`visitData.get()` will return an object like
```json
{
  "source": "google",
  "medium": "organic"
}
```

You can also run `visitData.rawData()` which will return a lot more information
