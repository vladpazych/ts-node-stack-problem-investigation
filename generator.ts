// var fs = require('fs-extra');
// var path = require('path');
// var errors = require('prettified').errors;
// var Promise = require('promise');
// var Handlebars = require('handlebars');

// var genSafetyString = 'generated';

// var startTime = Date.now();
// var mainFolder = 'code';
// var mainPath = './' + mainFolder;
// var compiledTemplates = {};
// var filesWriting = 0;

// regenerate(true);

// function regenerate(needCompileTemplates: boolean) {
//     try {
//         // clearCache();
//         var map = require(mainPath + '/map');
//         if (needCompileTemplates) compileTemplates(map);
//         generate(map);
//     } catch (err) {
//         errors.print(err);
//     }
// }

// function compileTemplates(map: Map) {
//     var partials = getPartials(map.partials);
//     for (var key in partials) {
//         Handlebars.registerPartial(key, partials[key]);
//     }

//     var helpers = map.helpers;
//     for (var key in helpers) {
//         Handlebars.registerHelper(key, helpers[key]);
//     }

//     compiledTemplates = {};
//     var templates = getTemplates(map.files)
//     for (var key in templates) {
//         var compiledTemplate = Handlebars.compile(templates[key], { noEscape: true });
//         compiledTemplates[key] = compiledTemplate;
//     }

//     var endTime = Date.now();
//     var resultTime = prettyDate(endTime, startTime);
//     showInfo("compiled in " + resultTime)
// }

// function passGenSafetyTest(path: string) {
//     return path.toLowerCase().indexOf(genSafetyString) != -1;
// }

// function generate(map: Map) {
//     var outputPath = path.join(mainPath, map.output);

//     if (!passGenSafetyTest(map.output)) {
//         showError("For safety reasons, output folder name should contain '" + genSafetyString + "' part.");
//         return;
//     }

//     ensureDir(outputPath)
//         .then(cleanGenerateDir(outputPath, map.files))
//         .then(function () {
//             for (var i = 0; i < map.files.length; i++) {
//                 (function (i) {
//                     var file = map.files[i];
//                     var templatePath = path.join(mainPath, file.template);
//                     var fileOutputPath = path.join(outputPath, file.output);
//                     var data = file.data;

//                     var outputContent = compiledTemplates[file.template](data);

//                     if (i == map.files.length - 1) {
//                         var endTime = Date.now();
//                         var resultTime = prettyDate(endTime, startTime);
//                         var fdef = i > 1 ? "templates" : "template";
//                         showInfo((i + 1) + " " + fdef + " filled in " + resultTime)
//                     }

//                     filesWriting++;

//                     ensureDir(fileOutputPath)
//                         .then(writeTemplateToFile(fileOutputPath, outputContent))
//                         .then(function () {
//                             filesWriting--;
//                             if (!filesWriting) {
//                                 var endTime = Date.now();
//                                 var resultTime = prettyDate(endTime, startTime);
//                                 var fdef = i > 1 ? "files" : "file";
//                                 showInfo(map.files.length + " " + fdef + " created in " + resultTime)
//                                 showWaiting()
//                             }
//                         })
//                 })(i);
//             }
//         });
// }



// //
// // Promises
// //
// function cleanGenerateDir(outputPath, files) {
//     return new Promise(function (fulfill, reject) {
//         var arr = outputPath.split('/');
//         var dir = arr[arr.length - 1];
//         var allFiles = getAllFiles(outputPath, null, '.meta');
//         var neededFiles = getFileListFromFileObject(outputPath, files);
//         var filesToDelete = [];

//         for (var i = 0; i < allFiles.length; i++) {
//             var currentFile = allFiles[i];
//             if (neededFiles.indexOf(currentFile) == -1) filesToDelete.push(currentFile);
//         }
//         if (passGenSafetyTest(outputPath)) {
//             for (var i = 0; i < filesToDelete.length; i++) {
//                 fs.unlink(filesToDelete[i]);
//             }

//             fulfill();
//         } else {
//             reject();
//             showError("Can't clean directory without '" + genSafetyString + "' part in it's name.");
//             console.log(outputPath);
//         }
//     });
// }

// function writeTemplateToFile(outputPath, outputContent) {
//     return new Promise(function (fulfill, reject) {
//         fs.writeFile(outputPath, outputContent, { flag: 'w' }, function (err) {
//             if (err) reject(err);
//             else fulfill();
//         });
//     });
// }

// function ensureDir(outputPath) {
//     return new Promise(function (fulfill, reject) {
//         fs.ensureDir(getDirFromFile(outputPath), function (err) {
//             if (err) reject(err);
//             else fulfill();
//         });
//     });
// }



// //
// // FS Helpers
// //
// function getTemplates(obj: { template: string }[]) {
//     if (obj == undefined) return {};
//     var templates = obj;
//     var result = {};

//     for (var key in templates) {
//         result[templates[key].template] = fs.readFileSync(path.join(mainPath, templates[key].template), 'utf8');
//     }

//     return result;
// }

// function getPartials(obj: { string }) {
//     if (obj == undefined) return {};
//     var partials = obj;
//     var result = {};

//     for (var key in partials) {
//         result[key] = fs.readFileSync(path.join(mainPath, partials[key]), 'utf8');
//     }

//     return result;
// }



// //
// // Common Helpers
// //
// function showError(err) {
//     console.log("Generation error: " + err);
// }

// function showInfo(info) {
//     console.log("Generation info: " + info);
// }

// function showWaiting() {
//     console.log("Listening for changes in " + mainPath + "/*");
// }

// function prettyDate(endTime, startTime) {
//     var ms = Math.floor((endTime - startTime));
//     if (ms < 1000) return ms + "ms";
//     return Math.floor(ms / 1000) + "sec " + ms % 1000 + "ms";
// }

// function clearCache() {
//     var keysToRemove = []
//     for (var key in require.cache) {
//         if (key.indexOf(mainFolder) != -1) keysToRemove.push(key);
//     }

//     for (var i in keysToRemove) {
//         delete require.cache[keysToRemove[i]];
//     }
// }

// function getDirFromFile(str: string) {
//     var arr = str.split('/');
//     arr.pop();
//     return arr.join('/');
// }

// function getAllFiles(dir, filelist, excepthEnding) {
//     var files = fs.readdirSync(dir);
//     filelist = filelist || [];
//     files.forEach(function (file) {
//         if (fs.statSync(path.join(dir, file)).isDirectory()) {
//             filelist = getAllFiles(path.join(dir, file), filelist, excepthEnding);
//         }
//         else {
//             if (excepthEnding) {
//                 if (file.indexOf(excepthEnding) == -1) {
//                     filelist.push(path.join(dir, file));
//                 }
//             } else {
//                 filelist.push(path.join(dir, file));
//             }
//         }
//     });
//     return filelist;
// }

// function getFileListFromFileObject(outputPath, files) {
//     var result = [];
//     for (var key in files) {
//         result.push(path.join(outputPath, files[key].output));
//     }

//     return result;
// }

// function fsExistsSync(myDir) {
//     try {
//         fs.accessSync(myDir);
//         return true;
//     } catch (e) {
//         return false;
//     }
// }



// // 
// // Interfaces
// //
// interface Map {
//     files: { template: string, output: string, data: {} }[];
//     partials: { string }
//     helpers: {}
//     output: string
// }
