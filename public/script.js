async function fetchItems() {
    try {
        const response = await fetch('http://localhost:3000/api/items');
        if (!response.ok) {
            throw new Error('Erro ao buscar os itens');
        }
        const items = await response.json();
        const itemsContainer = document.getElementById('items');
        itemsContainer.innerHTML = '';

        items.forEach(item => {
            const itemCard = `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="${item.imagem}" class="card-img-top" alt="${item.nome}">
                        <div class="card-body">
                            <h5 class="card-title">${item.nome}</h5>
                            <p class="card-text">${item.descricao}</p>
                            <p class="card-text">R$ ${item.valor.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            `;
            itemsContainer.innerHTML += itemCard;
        });
    } catch (error) {
        console.error(error.message);
    }
}

document.getElementById('itemForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nome', document.getElementById('nome').value);
    formData.append('descricao', document.getElementById('descricao').value);
    formData.append('valor', parseFloat(document.getElementById('valor').value));
    formData.append('imagem', document.getElementById('imagem').files[0]);

    try {
        const response = await fetch('http://localhost:3000/api/items', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Erro ao enviar o item');
        }
        document.getElementById('itemForm').reset();
        fetchItems();
    } catch (error) {
        console.error(error.message);
    }
});

// Carrega os itens ao iniciar
fetchItems();
