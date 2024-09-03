import glob from 'glob';
import { execSync } from 'child_process';
import { build } from 'esbuild';

build({
  entryPoints: glob.sync('./src/**/*.ts'),
  bundle: true,
  minify: true,
  platform: 'node',
  outdir: './dist',
  plugins: [
    {
      name: 'TypeScriptDeclarationsPlugin',
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length > 0) return;
          execSync('tsc --emitDeclarationOnly');
        });
      },
    },
  ],
}).then(result => {
  console.log(result);
}).catch((err) => {
  console.log(err);
}).finally(() => process.exit(1));