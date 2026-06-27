const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

// Define files to bundle in exact order
const jsFiles = [
  path.join(__dirname, 'node_modules/jquery/dist/jquery.js'),
  path.join(__dirname, 'node_modules/typeit/dist/index.umd.js'),
  path.join(__dirname, 'services/wallpaper-service.js'),
  path.join(__dirname, 'services/quote-service.js'),
  path.join(__dirname, 'services/clock-service.js'),
  path.join(__dirname, 'script.js')
];

const distDir = path.join(__dirname, 'dist');

async function build() {
  console.log('Starting build...');

  // 1. Recreate dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir);

  // 2. Concatenate JS files
  console.log('Bundling JavaScript files...');
  let concatenatedJs = '';
  for (const filePath of jsFiles) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    concatenatedJs += fs.readFileSync(filePath, 'utf8') + '\n;\n';
  }

  // 3. Minify JS
  console.log('Minifying JavaScript...');
  const jsResult = await esbuild.transform(concatenatedJs, {
    minify: true,
    loader: 'js',
  });
  fs.writeFileSync(path.join(distDir, 'bundle.js'), jsResult.code);

  // 4. Minify CSS
  console.log('Minifying CSS...');
  const cssPath = path.join(__dirname, 'style.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const cssResult = await esbuild.transform(cssContent, {
    minify: true,
    loader: 'css',
  });
  fs.writeFileSync(path.join(distDir, 'style.css'), cssResult.code);

  // 5. Copy project.json and preview.jpg
  console.log('Copying metadata and assets...');
  fs.copyFileSync(
    path.join(__dirname, 'project.json'),
    path.join(distDir, 'project.json')
  );
  if (fs.existsSync(path.join(__dirname, 'preview.jpg'))) {
    fs.copyFileSync(
      path.join(__dirname, 'preview.jpg'),
      path.join(distDir, 'preview.jpg')
    );
  }

  // 6. Generate dist/index.html
  console.log('Generating index.html...');
  let htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  
  // Replace the script tags block with the single bundle.js script tag
  const scriptRegex = /<script\s+src="jquery\.js"><\/script>[\s\S]*?<script\s+src="script\.js"><\/script>/i;
  
  if (scriptRegex.test(htmlContent)) {
    htmlContent = htmlContent.replace(scriptRegex, '<script src="bundle.js"></script>');
  } else {
    console.warn('Could not find standard script tags sequence, attempting fallback replacement...');
    const genericScriptRegex = /<script\s+src="[^"]+\.js"><\/script>\s*/gi;
    htmlContent = htmlContent.replace(genericScriptRegex, '');
    htmlContent = htmlContent.replace('</head>', '    <script src="bundle.js"></script>\n</head>');
  }

  fs.writeFileSync(path.join(distDir, 'index.html'), htmlContent);

  console.log('Build completed successfully! Output is in dist/');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
