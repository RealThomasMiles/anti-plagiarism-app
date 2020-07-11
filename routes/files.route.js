const express = require('express');
const router = express.Router();

const multer = require('multer');
const fs = require('fs-extra');
const util = require('util');
const path = require('path');
const leven = require('../functions/leven');
const shingle = require('../functions/shingling');
const { readFileSync } = require('fs-extra');

const getLevenWait = util.promisify(leven.getLeven);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'first-folder') {
            fs.mkdirp('public/uploads/first-folder', (err) => {
                if (err) {
                    console.log(err);
                } else {
                    cb(null, 'public/uploads/first-folder');
                }
            })
        } else {
            fs.mkdirp('public/uploads/second-folder', (err) => {
                if (err) {
                    console.log(err);
                } else {
                    cb(null, 'public/uploads/second-folder');
                }
            });
        };
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + file.originalname);
    }
});

const filter = (req, file, cb) => {
    if (file.mimetype.startsWith('text/')) {
        cb(null, true);
    } else {
        cb(null, false);
    };
};

const upload = multer({ storage: storage, fileFilter: filter });

router.post('/leven', upload.fields([{ name: 'first-folder', maxCount: 100 }, { name: 'second-folder', maxCount: 100 }]), (req, res) => {
    try {
        let filePath = '';
        const sourcesFirst = req.files['first-folder'].map((file) => {
            filePath = path.join(__dirname, '../', file.path);
            const source = readFileSync(filePath, 'utf8');
            fs.remove(filePath, err => {
                if (err) return console.error(err);
              })
            return {
                name: file.filename,
                source: source
            };
        });
        const sourcesSecond = req.files['second-folder'].map((file) => {
            filePath = path.join(__dirname, '../', file.path);
            const source = readFileSync(filePath, 'utf8');
            fs.remove(filePath, err => {
                if (err) return console.error(err);
              })
            return {
                name: file.filename,
                source: source
            };
        })
        let results = new Array()
        sourcesFirst.forEach((firstFolderFiles) => {
            sourcesSecond.forEach((secondFolderFiles) => {
                results.push({
                    firstFolderFile: firstFolderFiles.name,
                    secondFolderFile: secondFolderFiles.name,
                    plagiarized: leven.getLeven(firstFolderFiles.source, secondFolderFiles.source)
                })
            })
        })
        res.status(200).send(results);
    } catch (e) {
        res.status(500);
        console.log(e);
    };
});

router.post('/shingling', upload.fields([{ name: 'first-folder', maxCount: 100 }, { name: 'second-folder', maxCount: 100 }]), (req, res) => {
    try {
        let filePath = '';
        const sourcesFirst = req.files['first-folder'].map((file) => {
            filePath = path.join(__dirname, '../', file.path);
            const source = readFileSync(filePath, 'utf8');
            fs.remove(filePath, err => {
                if (err) return console.error(err);
              })
            return {
                name: file.filename,
                source: source
            };
        });
        const sourcesSecond = req.files['second-folder'].map((file) => {
            filePath = path.join(__dirname, '../', file.path);
            const source = readFileSync(filePath, 'utf8');
            fs.remove(filePath, err => {
                if (err) return console.error(err);
              })
            return {
                name: file.filename,
                source: source
            };
        })
        let results = new Array()
        sourcesFirst.forEach((firstFolderFiles) => {
            sourcesSecond.forEach((secondFolderFiles) => {
                results.push({
                    firstFolderFile: firstFolderFiles.name,
                    secondFolderFile: secondFolderFiles.name,
                    plagiarized: shingle.getShingle(firstFolderFiles.source, secondFolderFiles.source)
                });
            })
        })
        res.status(200).send(results);
    } catch (e) {
        res.status(500);
        console.log(e);
    };
});

module.exports = router;