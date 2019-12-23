// import conf from './system/config';
import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin';

import baseConfig from './webpack.config.base.babel';

export default merge(baseConfig, {
  output: {
    path: `${path.resolve('')}/${process.env.NODE_ENV}`,
    filename: './script/index.bundle.js',
    publicPath: '/'
  },
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('dist')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsPlugin({
      compilationSuccessInfo: {
        messages: ['You application is running here http://localhost:8080']
      },
      onErrors: () => {},
      clearConsole: true
    }),
    new webpack.NoEmitOnErrorsPlugin()
  ]
});
