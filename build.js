/*
 * @Author: Anixuil
 * @Date: 2024-12-15 20:37:17
 * @LastEditors: Anixuil
 * @LastEditTime: 2024-12-25 14:36:26
 * @Description: 请填写简介
 */
const fs = require('fs');
const path = require('path');

// 获取当前目录下的所有文件
const directoryPath = path.join(__dirname);
const files = fs.readdirSync(directoryPath);

// 创建dist文件夹
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true });
}
fs.mkdirSync(distPath);

// 获取时间戳
const timestamp = Date.now();

// 储存重命名后的文件名
const renamedFiles = [];

// 重命名文件并移动到dist文件夹
files.forEach(file => {
    if (file === 'index.js' || file === 'folder-alias.json' || file === 'index.html' || file === '.gitignore') {
        return;
    }

    const filePath = path.join(directoryPath, file);
    if (fs.lstatSync(filePath).isFile()) {
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        const newFileName = `${baseName}.${timestamp}${ext}`;
        const newFilePath = path.join(distPath, newFileName);

        // 复制文件到dist文件夹
        fs.copyFileSync(filePath, newFilePath);

        // 储存重命名后的文件名
        renamedFiles.push({ oldFileName: file, newFileName });
    }
});

// 复制index.html到dist文件夹
const indexPath = path.join(directoryPath, 'index.html');
if (fs.existsSync(indexPath)) {
    fs.copyFileSync(indexPath, path.join(distPath, 'index.html'));
}

// 更新引入地址
renamedFiles.forEach(({ oldFileName, newFileName }) => {
    updateImportPaths(distPath, oldFileName, newFileName);
});

// 更新引入地址的函数
function updateImportPaths(directory, oldFileName, newFileName) {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        const filePath = path.join(directory, file);
        if (fs.lstatSync(filePath).isFile() && (['.css', '.html'].includes(path.extname(file)))) {
            let content = fs.readFileSync(filePath, 'utf8');
            const regex = new RegExp(`(['"])(\\./)?${oldFileName}\\1`, 'g');
            content = content.replace(regex, `$1$2${newFileName}$1`);
            fs.writeFileSync(filePath, content, 'utf8');
        }
    });
}