const fs = require('fs');

const iconsDir = fs.readdirSync('./icons');
const icons = {};
for (const icon of iconsDir) {
  const name = icon.replace('.svg', '').toLowerCase();
  icons[name] = String(fs.readFileSync(`./icons/${icon}`));
}

if (!fs.existsSync('./public')) fs.mkdirSync('./public');
fs.writeFileSync('./public/icons.json', JSON.stringify(icons));
