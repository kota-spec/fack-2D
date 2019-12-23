import conf from '../config';

import gulp from 'gulp';
import plumber from 'gulp-plumber';
import rename from 'gulp-rename';
import notify from 'gulp-notify';
import postcss from 'gulp-postcss';
import autoPrefixer from 'autoprefixer';
import sass from 'gulp-sass';
import mqpacker from 'css-mqpacker';
import reporter from 'postcss-reporter';
import stylelints from 'stylelint';
import _import from 'postcss-easy-import';
import easing from 'postcss-easings';
import nested from 'postcss-nested';
import cleancss from 'gulp-clean-css';
import flexbugs from 'postcss-flexbugs-fixes';
import calc from 'postcss-calc';

// entry
const entryPath = `./${conf.src}/**/!(_)${conf.css}`;

const opts = [
  _import({
    path: ['node_modules'],
    glob: true
  }),
  easing(),
  autoPrefixer(),
  mqpacker({ sort: true }),
  flexbugs(),
  calc(),
  reporter({ clearMessages: true }),
  nested
];

gulp.task('stylelint', () => {
  return gulp
    .src(`./${conf.src}/**/${conf.css}`)
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      })
    )
    .pipe(postcss([stylelints, reporter({ clearMessages: true })]));
});

gulp.task(
  'css:dev',
  gulp.parallel('stylelint', () => {
    return gulp
      .src(`./${conf.src}/**/${conf.css}`)
      .pipe(
        plumber({
          errorHandler: notify.onError('Error: <%= error.message %>')
        })
      )
      .pipe(
        sass({
          outputStyle: 'expand'
        })
      )
      .pipe(postcss(opts))
      .pipe(rename({ extname: '.css' }))
      .pipe(gulp.dest(`./${conf.dist}`));
  })
);

gulp.task(
  'css:prod',
  gulp.parallel('stylelint', () => {
    return gulp
      .src(entryPath)
      .pipe(
        plumber({
          errorHandler: notify.onError('Error: <%= error.message %>')
        })
      )
      .pipe(
        sass({
          outputStyle: 'expand'
        })
      )
      .pipe(postcss(opts))
      .pipe(
        cleancss({
          compatibility: '*'
        })
      )
      .pipe(rename({ extname: '.css' }))
      .pipe(gulp.dest(`./${process.env.NODE_ENV}`));
  })
);
