//var path = require('path');
var temp = require('temp');
var exec = require('child_process').exec;
var fs = require('fs');
//var walk = require('walk');
//var async = require('async');
var glob = require('glob');

function execPromise(command) {
    return new Promise(function(resolve, reject) {
        exec(command, (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(stdout.trim());
        });
    });
}

export const pdf2png = (inputPath, callback?) => {
    return new Promise(function(resolve, reject) {
        fs.exists(inputPath, (exists) => {
            if (!exists) { 
                return callback(`error, no file exists at the path: ${inputPath}`); 
            }
            const outputPrefix = temp.path({ prefix: 'png_output' });
            const cmd = 'pdftopng "' + inputPath + '" "' + outputPrefix + '"';
            exec(cmd, (err /*, stderr, stdout */) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(outputPrefix);
                }
            });
        });
    });
}

export const pdftotext = (pdfPath) => {

    return new Promise((resolve, reject) => {
        pdf2png(pdfPath).then(pngPath => {
            glob(`${pngPath}-*.png`, async function (err, files) {
                if (err) {
                    return reject(err);
                } 
                const pages = [];
                for (let file of files) {
                    //console.log("Processing", file);
                    const cmd = 'tesseract "' + file + '" stdout';
                    try {
                        const result = await execPromise(cmd);
                        pages.push(result);
                    } catch (e) {
                        fs.unlinkSync(file);
                        return reject(e.message);
                    }
                    fs.unlinkSync(file);
                }
                resolve(pages);
            });        
        });
    })

}