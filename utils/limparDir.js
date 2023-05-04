const path = require('path');
const fs = require('fs');

exports.limparDir = () => {
    let caminhos = [];
   
    const uploadDir = function(myPath, bucketName) {

        function walkSync(currentDirPath, callback) {
            fs.readdirSync(currentDirPath).forEach(function (name) {
                var filePath = path.join(currentDirPath, name);
                var stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    callback(filePath, stat);
                } 
            });
        }
    
        walkSync(myPath, function(filePath, stat) {
            if(path.extname(filePath).toLowerCase() !== '.jpg') {
                filePath = '';
            }
            if(path.parse(filePath).base === 'blank.jpg') {
                filePath = '';
            }
            // filePath = path.extname(filePath).toLowerCase() === '.jpg' || path.parse(filePath).base === 'blank.jpg' ? filePath : '';
            if (filePath !== '') caminhos.push(filePath);
        });
    };
    
 
    uploadDir(path.resolve('./'));
    caminhos.forEach(async (element) => {  
            fs.unlink(element, function(err) {
                if(err && err.code == 'ENOENT') {
                    console.info("Arquivo não existe, não será removido.");
                } else if (err) {
                    console.error("Erro ocorreu enquanto arquivo era removido.");
                } else {
                    console.info(`Removido.`);
                }
            });
        
    });
} 