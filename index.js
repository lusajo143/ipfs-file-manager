const express = require('express')
const layouts = require('express-ejs-layouts')
const formidable = require('formidable')
const { create } = require('ipfs-http-client')
const fs = require('fs')

const app = express()
const ipfs = create()
const ipfsCheck = create({
    host:'172.18.0.2',
    port: 5001,
    protocol: 'http'
})



app.set('view engine', 'ejs')
app.use(layouts)

async function addFileToIPFS(ipfsInsert, path) {
    const result = await ipfsInsert.add({content: fs.readFileSync(path)})
    console.log(result.path);
    return result.path
}

async function VerifyFile(ipfsInsert, path, Qm, res) {
    const result = await ipfsInsert.add({content: fs.readFileSync(path)})
    if (result.path == Qm) {
        res.send('<script>alert("valid"); window.history.back();</script>')
    } else {
        res.send('<script>alert("Invalid"); window.history.back();</script>')
    }
    
}

app.get('/', (req, res)=>{
    res.render('index')
})

app.post('/add', (req, res)=>{
    let form = new formidable.IncomingForm()
    let filename
    let path

    form.uploadDir = './public/uploads'
    form.multiples = false
    
    form.parse(req)
    
    form.on('field', (name, field)=>{
        if (name == 'filename') filename = field
    }).on('fileBegin', (name, file) => {
        file.path = './public/uploads/'+filename+'.'+file.name.split('.')[file.name.split('.').length - 1]
        path = file.path
    }).on('file', ()=>{
        addFileToIPFS(ipfs, path)
        console.log(path);
        res.send('<script>alert("Uploaded successfully"); window.history.back();</script>')
    })
})

app.get('/view', (req, res)=>{
    res.render('view')
})

app.get('/verify', (req, res)=>{
    res.render('verify')
})

app.post('/verify', (req, res) => {
    let form = new formidable.IncomingForm()

    let path
    form.uploadDir = './public/verify/'
    form.parse(req).on('fileBegin', (name, file)=>{
        path = './public/verify/'+new Date().getTime()+'.'+file.name.split('.')[file.name.split('.').length - 1]
        file.path = path
    }).on('file', async ()=>{
        VerifyFile(ipfsCheck, path, 'QmcByNefBguQKJpkjQVy9wN1YK1sRtCwjW8k5x6jaYsdrH', res)
    })
})


app.listen(5000, ()=>{
    console.log('Server listening at 5000');
})