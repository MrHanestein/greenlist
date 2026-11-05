const fs=require('node:fs');
let html=fs.readFileSync('.next/server/app/index.html','utf8');
html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*href="[^"]*_next[^"]*"[^>]*>/gi,'');
html=html.replace('</head>','<link rel="stylesheet" href="style.css"></head>');
fs.writeFileSync('../marketing/index.html',html);fs.copyFileSync('src/app/globals.css','../marketing/style.css');
console.log('Static marketing refreshed from the built homepage');
