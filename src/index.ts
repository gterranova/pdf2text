import { pdftotext } from './lib/tesseract';
var path = require('path');
var fs = require('fs');

//var textract = require('textract');

var args = process.argv.slice(2);

async function* getFiles(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        let res = path.join(dir, item.name);
        if (!item.isDirectory()) {
            yield res;
        } else {
            yield* getFiles(res);
        }
    }
}

(async () => {
    for await (const file of getFiles(args[0])) { 
        if (file.endsWith('.pdf')) {
            console.log("Processing", file);
            pdftotext(file).then((pages: any[]) => {
                fs.writeFile(file.replace(/\.[^/.]+$/, ".txt"), pages.join('\n'), () => console.log("Saved", file.replace(/\.[^/.]+$/, ".txt")));
            });    
        }
    };
})();
