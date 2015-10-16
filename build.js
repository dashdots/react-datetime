import webpack from 'webpack';
import path from 'path';
import del from 'del';

const DEBUG = !process.argv.includes('release');
const VERBOSE = process.argv.includes('verbose');
const config = {

  entry: ['./DateTime.js'],

  output: {
    path: __dirname + "/dist/",
    library: 'Datetime',
    filename: 'datetime.js',
    libraryTarget: 'umd'
  },

  devtool: DEBUG ? 'cheap-module-eval-source-map' : false,

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
    'moment': 'moment'
  },


  module: {

    loaders: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, './'),
        ],
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  plugins: [

    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(DEBUG ? 'production' : 'development')
      }
    }),
    ...(!DEBUG ? [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: VERBOSE
        }
      }),
      new webpack.optimize.AggressiveMergingPlugin(),
    ] : [])

  ]
};

const clean = async () => {
  console.log('clean');
  await del(['dist/*'], {dot: true});
};


const build = async () => new Promise((resolve, reject) => {
  console.log('bundle');
  const bundler = webpack(config);
  let bundlerRunCount = 0;

  function bundle(err, stats) {
    if (err) {
      return reject(err);
    }
    console.log(stats.toString());
    return resolve();
  }
  console.log('run');
  bundler.run(bundle);
});

export default async () => {
  await clean();
  return await build();
}
