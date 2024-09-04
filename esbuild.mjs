import glob from 'glob';
import { build } from 'esbuild';

build({
  entryPoints: glob.sync('./src/**/*.ts'),
  bundle: true,
  minify: true,
  platform: 'node',
  outdir: './dist',
  plugins: [],
}).then(result => {
  console.log(result);
}).catch((err) => {
  console.log(err);
  process.exit(1);
});