const express = require('express')
const router = express.Router()
const exec = require('child_process').exec

const async = require('async')
const Web3 = require('web3')
const tmp = require('tmp')
const fs = require('fs')


router.post('/wast2wasm', function(req, res, next) {
  if (!req.body.wast) {
    throw "must include wast"
  }

	tmp.file( (err, path, fd, cb) => {
		if (err) throw err;

    wastBuf = Buffer.from(req.body.wast, 'ascii')
    fs.write(fd, wastBuf, 0, wastBuf.length, null, (err) => {
      if (err) throw err
      exec('wasm-as '+path,
        (error, stdout, stderr) => {
          debugger
          let data = fs.readFileSync(path+".wasm").toString('hex')
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({ wasm: data}));
        })
    })
  })
})

module.exports = router
