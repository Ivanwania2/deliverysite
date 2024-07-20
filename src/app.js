const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();
const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/items', async (req, res) => {
    try {
        console.log('Recebida solicitação GET para /api/items');
        const items = await prisma.items.findMany();
        console.log('Itens recuperados do banco de dados:', items);
        res.json(items);
    } catch (error) {
        console.error('Erro ao buscar itens:', error);
        res.status(500).json({ error: 'Erro ao buscar itens' });
    }
});

app.post('/api/items', upload.single('imagem'), async (req, res) => {
    try {
        const { nome, descricao, valor } = req.body;
        const imagem = req.file;

        const { data, error } = await supabase.storage
            .from('images')  // Certifique-se de que o bucket 'images' exista
            .upload(`public/${imagem.originalname}`, imagem.buffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: imagem.mimetype,
            });

        if (error) throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);

        const imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/images/public/${imagem.originalname}`;

        const newItem = await prisma.items.create({
            data: {
                nome,
                descricao,
                valor: parseFloat(valor),
                imagem: imageUrl, // URL da imagem
            },
        });

        console.log('Novo item criado:', newItem);
        res.json(newItem);
    } catch (error) {
        console.error('Erro ao criar item:', error);
        res.status(500).json({ error: `Erro ao criar item, Detalhes: ${error.message}` });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
