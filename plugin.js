import {
  defaults,
  compact
} from 'lodash';

import fs from 'fs';

const defaultConfig = {
  extensions: [
    'ttf',
    'woof'
  ],
  map: {}
};

const config = defaults(getConfig('fonts.json'), defaultConfig);

class FontsCompiler extends CachingCompiler {
  constructor() {
    super({
      compilerName: 'fontsCompiler',
      defaultCacheSize: 1024 * 1024 * 10,
    });
  }

  processFilesForTarget(files) {
    if (!config.map) {
      return;
    }

    const proccesedFiles = compact(files.map((file) => {
      const customPath = config.map[file.getPathInPackage()];

      if (!customPath) {
        return;
      }

      file.customPath = customPath;

      return file;
    }));

    if (proccesedFiles) {
      super.processFilesForTarget(proccesedFiles);
    }
  }

  getCacheKey(file) {
    return file.getSourceHash();
  }

  compileResultSize(result) {
    return result.length;
  }

  compileOneFile(file) {
    return file.getContentsAsBuffer();
  }

  addCompileResult(file, result) {
    const path = file.customPath;

    file.addAsset({
      data: result,
      path: path
    });
  }
}

function getConfig(configFileName) {
  var path = Plugin.path;

  var appdir = process.env.PWD || process.cwd();
  var custom_config_filename = path.join(appdir, configFileName);
  var userConfig = {};

  if (fs.existsSync(custom_config_filename)) {
    userConfig = fs.readFileSync(custom_config_filename, {
      encoding: 'utf8'
    });
    userConfig = JSON.parse(userConfig);
  }
  return userConfig;
}


Plugin.registerCompiler({
  extensions: config.extensions
}, () => new FontsCompiler);
