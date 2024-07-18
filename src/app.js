const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

// Configuração do multer para armazenar imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static('uploads')); // Serve os arquivos de imagem

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/items', async (req, res) => {
    const items = await prisma.item.findMany();
    res.json(items);
});

app.post('/api/items', upload.single('imagem'), async (req, res) => {
    const { nome, descricao, valor } = req.body;
    const newItem = await prisma.item.create({
        data: {
            nome,
            descricao,
            valor,
            imagem: `/uploads/${req.file.filename}`, // Caminho da imagem
        },
    });
    res.json(newItem);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
