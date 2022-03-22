# VisitDataJS

visitdata.js emulates the source, medium, campaign, content and term data just like Google Analytics does it (ga.js).

Since there is no way to extract this information from ga.js directly, you need a library like visitdata.js to do it.

## Include from cdn

Here's the file you can include in your web page directly from CDN:
https://cdn.ilkkapeltola.com/visitdatajs/latest/visitdata.js


## Build from source code

clone this repository and then

```sh
npm install
npm run build
```

the javascript you need is at dist/visitdata.js

## Usage

I'm loading this from a CDN, but you might want to host the file yourself.

```html
<script src="https://cdn.ilkkapeltola.com/visitdatajs/latest/visitdata.js"></script>
<script>console.log(visitData.get());</script>
```

`visitdata.get()` will return an object like
```json
{
  "source": "google",
  "medium": "organic"
}
```

You can also run `visitdata.rawData()` which will return a lot more information

## Combine with globalStorage

Typically you likely need this data elsewhere. If so, combine this with [globalStorage](https://github.com/ilkkapeltola/global-storage)