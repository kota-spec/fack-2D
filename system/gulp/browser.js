import conf from '../config';

import gulp from 'gulp';
import browserSync from 'browser-sync';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import webpackConfig from '../../webpack.config.dev.babel';

const defaultStatsOptions = {
  colors: true,
  hash: false,
  timings: false,
  chunks: false,
  chunkModules: false,
  modules: false,
  children: true,
  version: true,
  cached: true,
  cachedAssets: true,
  reasons: true,
  source: true,
  errorDetails: true
};

gulp.task('reload', done => {
  browserSync.reload();
  done();
});

gulp.task('browser', () => {
  const bundle = webpack(webpackConfig);
  return browserSync({
    notify: false,
    port: 8080,
    open: false,
    reloadOnRestart: true,
    server: {
      baseDir: [conf.src, conf.dist],
      middleware: [
        webpackDevMiddleware(bundle, {
          publicPath: webpackConfig.output.publicPath,
          stats: defaultStatsOptions
        }),
        webpackHotMiddleware(bundle)
      ]
    }
  });
});
