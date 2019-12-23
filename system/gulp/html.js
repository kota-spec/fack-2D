import conf from '../config';
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import pug from 'gulp-pug';
import pugLinter from 'gulp-pug-linter';
import pugLintStylish from 'puglint-stylish';
import rename from 'gulp-rename';
import fs from 'fs';

const entryPath = `./${conf.src}/**/!(_)${conf.pug}`;

gulp.task('pug:lint', () => {
  return gulp.src(`./${conf.src}/**/${conf.pug}`).pipe(
    pugLinter({
      reporter: pugLintStylish
    })
  );
});

/**
 * jsonデータをまとめる関数
 * @returns {object} - page配下のjsonデータをまとめたオブジェクトを返す
 */
const jsonData = () => {
  const dirname = `./${conf.data}/page`; // jsonデータが格納されているファイル
  const files = fs.readdirSync(dirname); // jsonファイルの名前を取得
  let jsonData = {}; // jsonデータを格納する変数

  files.forEach(fileName => {
    const parse = JSON.parse(
      fs.readFileSync(`${process.cwd()}/${conf.data}/page/${fileName}`, 'utf8')
    ); // 各jsonをパースする
    Object.assign(jsonData, parse); // パースしたjsonを用意した変数にマージしていく
  });

  return jsonData; // マージしたjsonを返す
};

gulp.task(
  'pug:dev',
  gulp.parallel('pug:lint', () => {
    return gulp
      .src(entryPath)
      .pipe(
        plumber({
          errorHandler: notify.onError('Error: <%= error.message %>')
        })
      )
      .pipe(
        pug({
          basedir: conf.src,
          pretty: true,
          cache: false,
          data: {
            data: jsonData()
          }
        })
      )
      .pipe(
        rename(path => {
          path.dirname += '/../'; // 一つ上の階層に移動
        })
      )
      .pipe(gulp.dest(`./${conf.dist}`));
  })
);

gulp.task(
  'pug:prod',
  gulp.parallel('pug:lint', () => {
    return gulp
      .src(entryPath)
      .pipe(
        plumber({
          errorHandler: notify.onError('Error: <%= error.message %>')
        })
      )
      .pipe(
        pug({
          basedir: conf.src,
          pretty: false,
          cache: false,
          data: {
            data: jsonData()
          }
        })
      )
      .pipe(
        rename(path => {
          path.dirname += '/../'; // 一つ上の階層に移動
        })
      )
      .pipe(gulp.dest(process.env.NODE_ENV));
  })
);
