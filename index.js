import icons from '../public/icons.json';

const iconNameList = [...new Set(Object.keys(icons).map(i => i.split('-')[0]))];
const shortNames = {
  javascript: 'javascript',
  mongodb: 'mongodb',
  express: 'expressjs',
};
const themedIcons = [
  ...Object.keys(icons)
    .filter(i => i.includes('-light') || i.includes('-dark'))
    .map(i => i.split('-')[0]),
];

const ICONS_PER_LINE = 15;
const ONE_ICON = 120;
const SCALE = ONE_ICON / (300 - 44);

function generateSvg(iconNames, perLine) {
  const iconSvgList = iconNames.map(i => icons[i]);

  const length = Math.min(perLine * 300, iconNames.length * 300) - 44;
  const height = Math.ceil(iconSvgList.length / perLine) * 300 - 44;
  const scaledHeight = 28;
  const scaledWidth = length * SCALE;

  return `
  <svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${scaledWidth} ${scaledHeight}" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
    ${iconSvgList
      .map(
        (i, index) =>
          `
        <g transform="translate(${(index % perLine) * 120}, ${
            Math.floor(index / perLine) * 120
          })">
          ${i}
        </g>
        `
      )
      .join(' ')}
  </svg>
  `;
}

function parseShortNames(names, theme = 'dark') {
  return names.map(name => {
    if (iconNameList.includes(name))
      return name + (themedIcons.includes(name) ? `-${theme}` : '');
    else if (name in shortNames)
      return (
        shortNames[name] +
        (themedIcons.includes(shortNames[name]) ? `-${theme}` : '')
      );
  });
}

export default function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname, searchParams } = url;

  const path = pathname.replace(/^\/api\/|\/$/g, '');

  if (path === 'options') {
    const iconParam = searchParams.get('i') || searchParams.get('icons');
    if (!iconParam)
      return res.status(400).send("You didn't specify any icons!");

    const theme = searchParams.get('t') || searchParams.get('theme');
    if (theme && theme !== 'dark' && theme !== 'light')
      return res.status(400).send('Theme must be either "light" or "dark"');

    const perLine = Number(searchParams.get('perline')) || ICONS_PER_LINE;
    if (isNaN(perLine) || perLine < -1 || perLine > 50)
      return res
        .status(400)
        .send('Icons per line must be a number between 1 and 50');

    let iconShortNames = [];
    if (iconParam === 'all') iconShortNames = iconNameList;
    else iconShortNames = iconParam.split(',');

    const iconNames = parseShortNames(iconShortNames, theme || undefined);
    if (!iconNames)
      return res
        .status(400)
        .send("You didn't format the icons param correctly!");

    const svg = generateSvg(iconNames, perLine);

    res.setHeader('Content-Type', 'image/svg+xml');
    return res.status(200).send(svg);
  } else if (path === 'icons') {
    return res.status(200).json(iconNameList);
  } else if (path === 'svgs') {
    return res.status(200).json(icons);
  } else {
    return res.status(404).send('Not found');
  }
}
