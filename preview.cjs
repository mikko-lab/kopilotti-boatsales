'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assets = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/privacy.html': ['privacy.html', 'text/html; charset=utf-8'],
  '/style.css': ['style.css', 'text/css; charset=utf-8'],
  '/kopilotti-mark.svg': ['kopilotti-mark.svg', 'image/svg+xml'],
  '/inter-variable.woff2': ['inter-variable.woff2', 'font/woff2'],
  '/yacht-lifestyle.png': ['yacht-lifestyle.png', 'image/png'],
};
for (const language of ['fi','sv']) {
  assets[`/${language}/`] = [`${language}/index.html`, 'text/html; charset=utf-8'];
  assets[`/${language}/privacy.html`] = [`${language}/privacy.html`, 'text/html; charset=utf-8'];
}
const server = http.createServer((req, res) => {
  const headers = {'X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; script-src 'none'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"};
  if (!/^127\.0\.0\.1:\d+$/.test(req.headers.host || '')) {res.writeHead(403, headers); return res.end('Forbidden');}
  const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
  const asset = assets[pathname];
  if (!['GET','HEAD'].includes(req.method) || !asset) {res.writeHead(404,headers);return res.end('Not found');}
  const data = fs.readFileSync(path.join(__dirname, 'site', asset[0]));
  res.writeHead(200, {...headers,'Content-Type':asset[1]});
  res.end(req.method === 'HEAD' ? undefined : data);
});
server.listen(Number(process.env.PORT || 4318),'127.0.0.1',()=>console.log('BoatSales presentation: http://127.0.0.1:' + server.address().port));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
