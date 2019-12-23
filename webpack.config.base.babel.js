import conf from './system/config';
import glob from 'glob';

const entries = [];

glob
  .sync(`./${conf.src}/**/${conf.js}`, {
    ignore: `./${conf.src}/**/_${conf.js}`
  })
  .map(file => entries.push(file));

export default {
  entry: entries,

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(vert|frag|glsl)$/i,
        use: [{ loader: 'raw-loader' }, { loader: 'glslify-loader' }],
        exclude: /node_modules/
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          fix: true,
          formatter: require('eslint/lib/cli-engine/formatters/stylish')
        }
      }
    ]
  }
  // jsを複数を使う時に使う。
  // optimization: {
  //   splitChunks: {
  //     name: 'sheard/scripts/vendor.js',
  //     chunks: 'initial'
  //   }
  // },
};
