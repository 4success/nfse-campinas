const glob = require('glob');
const child_process = require('child_process');
const nativeNodeModulesPlugin = require('./native-node-module');

let externals = undefined;

require('esbuild').build({
  entryPoints: glob.sync('./src/**/*.ts'),
  outdir: './dist',
  bundle: true,
  minify: true,
  platform: 'node',
  sourcemap: true,
  target: 'node14',
  external: externals,
  logLevel: 'error',
  plugins: [
    nativeNodeModulesPlugin,
    {
      name: 'TypeScriptDeclarationsPlugin',
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length > 0) return
          child_process.execSync('tsc')
        })
      }
    }
  ],
}).catch((err) => {
  console.log(err);
  process.exit(1);
});
