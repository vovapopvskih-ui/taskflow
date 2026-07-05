const http = require('http');

http.get('http://localhost:3000/', (res) => {
  let html = '';
  res.on('data', (c) => (html += c));
  res.on('end', () => {
    const match = html.match(/href="([^"]+\.css)"/);
    if (!match) {
      console.log('No CSS link found in HTML');
      return;
    }
    let cssUrl = match[1];
    if (cssUrl.startsWith('/')) cssUrl = 'http://localhost:3000' + cssUrl;
    console.log('CSS URL:', cssUrl);
    http.get(cssUrl, (r2) => {
      let css = '';
      r2.on('data', (c) => (css += c));
      r2.on('end', () => {
        console.log('CSS Status:', r2.statusCode, 'Length:', css.length);
        console.log('Has backdrop-filter:', css.includes('backdrop-filter'));
        console.log('Has radial-gradient:', css.includes('radial-gradient'));
        console.log('Has .glass:', css.includes('.glass'));
        console.log('Has saturate:', css.includes('saturate'));
        console.log('Has box-shadow inset:', css.includes('inset 0 1px'));
      });
    }).on('error', (e) => console.error('CSS fetch err:', e.message));
  });
}).on('error', (e) => console.error('ERR:', e.message));
