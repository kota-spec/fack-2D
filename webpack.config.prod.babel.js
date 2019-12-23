import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';

import baseConfig from './webpack.config.base.babel';

export default merge(baseConfig, {
  output: {
    path: `${path.resolve('')}/${process.env.NODE_ENV}`,
    filename: './script/index.bundle.js'
  },
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
});
