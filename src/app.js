const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Certifique-se de que a pasta uploads existe
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configuração do multer para armazenar imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve os arquivos de imagem

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/items', async (req, res) => {
    try {
        const items = await prisma.item.findMany();
        res.json(items);
    } catch (error) {
        console.error('Erro ao buscar itens:', error);
        res.status(500).json({ error: 'Erro ao buscar itens' });
    }
});

app.post('/api/items', upload.single('imagem'), async (req, res) => {
    try {
        const { nome, descricao, valor } = req.body;
        const newItem = await prisma.item.create({
            data: {
                nome,
                descricao,
                valor: parseFloat(valor), // Certifique-se de que o valor é um número
                imagem: `/uploads/${req.file.filename}`, // Caminho da imagem
            },
        });
        res.json(newItem);
    } catch (error) {
        console.error('Erro ao criar item:', error);
        res.status(500).json({ error: 'Erro ao criar item' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
