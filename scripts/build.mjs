import { build, context } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const watch = process.argv.includes('--watch');

const root = process.cwd();
const distDir = path.join(root, 'dist');
const headerPath = path.join(root, 'userscript.header.txt');
const bundlePath = path.join(distDir, 'bundle.js');
const outPath = path.join(distDir, 'buff163-tools.user.js');

fs.mkdirSync(distDir, { recursive: true });

function assembleUserscript() {
    const header = fs.readFileSync(headerPath, 'utf8').trimEnd();
    const bundle = fs.readFileSync(bundlePath, 'utf8');
    fs.writeFileSync(outPath, `${header}\n\n${bundle}\n`);
    console.log(`Built ${path.relative(root, outPath)}`);
}

const userscriptPlugin = {
    name: 'userscript-assemble',
    setup(buildApi) {
        buildApi.onEnd((result) => {
            if (result.errors.length === 0 && fs.existsSync(bundlePath)) {
                assembleUserscript();
            }
        });
    },
};

const buildOptions = {
    entryPoints: ['src/main.js'],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['chrome110', 'firefox110', 'safari16'],
    outfile: bundlePath,
    legalComments: 'none',
    plugins: [userscriptPlugin],
};

if (watch) {
    const ctx = await context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes...');
} else {
    await build(buildOptions);
}
