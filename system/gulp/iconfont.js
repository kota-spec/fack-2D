import gulp from 'gulp';
import iconfont from 'gulp-iconfont';
import iconfontCss from 'gulp-iconfont-css';
import iconfontTemplate from 'gulp-iconfont-template';

import conf from '../config';
import path from 'path';

const runTimestamp = Math.round(Date.now() / 1000);
const fontName = 'Icons';
const entryPath = `${path.resolve('')}/icon/**/*.svg`;

gulp.task('iconfont', () => {
  return gulp
    .src(entryPath)
    .pipe(
      iconfontCss({
        fontName: fontName, // テンプレートで定義するfontname
        path: `${path.resolve('')}/icon/css/_icons.scss`, // アイコンのフォントのテンプレートを定義
        targetPath: `css/_icons.scss`, // テンプレートのcssを吐き出す
        fontPath: '/shared/icons' // font-faceで定義するパスの設定
      })
    )
    .pipe(
      iconfont({
        prependUnicode: false,
        fontName: fontName, // フォント化する時の名前 + font-familyの名前
        formats: ['ttf', 'eot', 'woff'], // 吐き出したい拡張子を定義
        normalize: true,
        timestamp: runTimestamp
      })
    )
    .pipe(gulp.dest(`./${conf.src}/shared/icons`));
});

gulp.task('iconfont:template', () => {
  return gulp
    .src(entryPath)
    .pipe(
      iconfontTemplate({
        fontName: fontName,
        path: `${path.resolve('')}/icon/template/index.html`,
        targetPath: 'index.html',
        fontPath: '/shared/icons' // font-faceで定義するパスの設定
      })
    )
    .pipe(gulp.dest(`./${conf.dist}/icon`));
});

gulp.task('iconfont:build', gulp.series('iconfont', 'iconfont:template'));
