'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assets = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/404.html': ['404.html', 'text/html; charset=utf-8'],
  '/privacy.html': ['privacy.html', 'text/html; charset=utf-8'],
  '/robots.txt': ['robots.txt', 'text/plain; charset=utf-8'],
  '/sitemap.xml': ['sitemap.xml', 'application/xml; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
  '/kopilotti-mark.svg': ['kopilotti-mark.svg', 'image/svg+xml'],
  '/inter-variable.woff2': ['inter-variable.woff2', 'font/woff2'],
  '/yacht-lifestyle.png': ['yacht-lifestyle.png', 'image/png'],
  '/media/boatsales-introduction-2026-09.mp4': ['media/boatsales-introduction-2026-09.mp4', 'video/mp4'],
  '/media/boatsales-video-poster-2026-09.jpg': ['media/boatsales-video-poster-2026-09.jpg', 'image/jpeg'],
};
for (const language of ['fi','sv']) {
  assets[`/${language}/`] = [`${language}/index.html`, 'text/html; charset=utf-8'];
  assets[`/${language}/privacy.html`] = [`${language}/privacy.html`, 'text/html; charset=utf-8'];
}
const server = http.createServer((req, res) => {
  const headers = {'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"};
  if (!/^127\.0\.0\.1:\d+$/.test(req.headers.host || '')) {res.writeHead(403, headers); return res.end('Forbidden');}
  const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
  const asset = assets[pathname];
  if (!['GET','HEAD'].includes(req.method) || !asset) {res.writeHead(404,headers);return res.end('Not found');}
  const data = fs.readFileSync(path.join(__dirname, 'site', asset[0]));
  const mediaHeaders = {...headers, 'Content-Type':asset[1], 'Content-Length':data.length};
  if (asset[1] === 'video/mp4') {
    mediaHeaders['Accept-Ranges'] = 'bytes';
    if (req.method === 'GET' && req.headers.range) {
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      const first = range?.[1];
      const last = range?.[2];
      const start = first ? Number(first) : Math.max(0, data.length - Number(last));
      const end = first && last ? Math.min(Number(last), data.length - 1) : data.length - 1;
      if (!range || (!first && !last) || !Number.isSafeInteger(start) ||
          !Number.isSafeInteger(end) || start < 0 || start > end || start >= data.length) {
        res.writeHead(416, {...headers, 'Content-Range':`bytes */${data.length}`});
        return res.end();
      }
      res.writeHead(206, {...mediaHeaders, 'Content-Length':end - start + 1,
        'Content-Range':`bytes ${start}-${end}/${data.length}`});
      return res.end(data.subarray(start, end + 1));
    }
  }
  res.writeHead(200, mediaHeaders);
  res.end(req.method === 'HEAD' ? undefined : data);
});
server.listen(Number(process.env.PORT || 4318),'127.0.0.1',()=>console.log('BoatSales presentation: http://127.0.0.1:' + server.address().port));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
