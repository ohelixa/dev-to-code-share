const extract = require("extract-svg-path");
const path = require("path");
const fs = require("fs");
const directoryPath = path.join(".", "src");
const iconfileName = "icons.json";
const semver = require('semver');
const SVGO = require('svgo')
let project = require('../package.json');

const dirTree = require('directory-tree');

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

const svgo = new SVGO({
    plugins: [{
      cleanupAttrs: true,
    }, {
      removeDoctype: true,
    },{
      removeXMLProcInst: true,
    },{
      removeComments: true,
    },{
      removeMetadata: true,
    },{
      removeTitle: true,
    },{
      removeDesc: true,
    },{
      removeUselessDefs: true,
    },{
      removeEditorsNSData: true,
    },{
      removeEmptyAttrs: true,
    },{
      removeHiddenElems: true,
    },{
      removeEmptyText: true,
    },{
      removeEmptyContainers: true,
    },{
      removeViewBox: false,
    },{
      cleanupEnableBackground: true,
    },{
      convertStyleToAttrs: true,
    },{
      convertColors: true,
    },{
      convertPathData: true,
    },{
      convertTransform: true,
    },{
      removeUnknownsAndDefaults: true,
    },{
      removeNonInheritableGroupAttrs: true,
    },{
      removeUselessStrokeAndFill: true,
    },{
      removeUnusedNS: true,
    },{
      cleanupIDs: true,
    },{
      cleanupNumericValues: true,
    },{
      moveElemsAttrsToGroup: true,
    },{
      moveGroupAttrsToElems: true,
    },{
      collapseGroups: true,
    },{
      removeRasterImages: false,
    },{
      mergePaths: true,
    },{
      convertShapeToPath: true,
    },{
      sortAttrs: true,
    },{
      removeDimensions: true,
    },{
      removeAttrs: {attrs: '(stroke|fill)'},
    }]
  });


const readIcons = async function() {
  let icons = {};
  const svgs = await dirTree(directoryPath, { extensions: /\.svg/ });

  await asyncForEach(svgs.children, async (file) => {
    await optimizeSvg(file.path);
    const m = extract(file.path);
    icons[file.name.split('.').slice(0, -1).join('.').toLowerCase()] = m;
  });

  return icons;
};


const updatePackageVersion = async() => {
    const newVer = semver.inc(project.version, 'patch');
    project.version = newVer;  
    try {
        fs.writeFileSync('package.json', JSON.stringify(project));
        console.log("New version", newVer);
      } catch (err) {
        console.error(err);
      }
}

const storeData = (data, path) => {
  try {
    fs.writeFileSync(iconfileName, JSON.stringify(data, null, 2));
    updatePackageVersion();
  } catch (err) {
    console.error(err);
  }
};

const wirteJson = async () => {
  const icons = await readIcons();
  storeData(icons, `./${directoryPath}`);
};

const optimizeSvg = async (filePath) => {
    const file = await fs.readFileSync(filePath, 'utf8');
    const optimize = await svgo.optimize(file);
    return optimize;
}


wirteJson();