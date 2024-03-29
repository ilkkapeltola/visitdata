# visitData

`visitData` emulates the source, medium, campaign, content and term data just like Google Analytics does it (ga.js).

Since there is no way to extract this information from ga.js directly, you need a library like `visitData` to do it.

visitData is used on over 40 million page loads every week, just from the CDN:

<img src="images/visitdata_pageloads.png" alt="visitData 40M page loads in a weeks" height="300">


## Questions / Contact

If you have any questions for this, drop me an email at [ilkkapel@gmail.com](mailto:ilkkapel@gmail.com)

## Include from cdn
:warning: note, the CDN location has changed. Read why from the [Announcement](https://github.com/ilkkapeltola/visitdata/discussions/3).

Here's the file you can include in your web page directly from CDN:
https://cdn.jsdelivr.net/npm/visitdata/dist/visitdata.umd.js

## Supported module formats

- CommonJS: https://cdn.jsdelivr.net/npm/visitdata/dist/visitdata.cjs.js
- UMD: https://cdn.jsdelivr.net/npm/visitdata/dist/visitdata.umd.js
- ESM: https://cdn.jsdelivr.net/npm/visitdata/dist/visitdata.esm.js

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

## Usage

```html
<script src="https://cdn.jsdelivr.net/npm/visitdata/dist/visitdata.umd.js"></script>
<script>console.log(visitData.get());</script>

<!-- or, and this you can copy into a javascript console without the <script> tag too for testing -->

<script>
  await import('https://cdn.jsdelivr.net/npm/visitdata/dist/visitdata.umd.js')
  console.log(visitData.get())
</script>

```

`visitData.get()` will return an object like
```json
{
  "source": "google",
  "medium": "organic"
}
```

You can also run `visitData.rawData()` which will return a lot more information

The results are cached with sessionStorage, so subsequent page views in the same session will return the original result.
