# Textor – Serviços Residenciais

Landing page da Textor: montagem de móveis, instalações e pintura, ar-condicionado, drywall e redes de proteção para pets.

Site estático (HTML + CSS + JavaScript puro), sem build.

## Rodar localmente

```bash
python3 -m http.server 5178
```

Abra `http://localhost:5178`.

## Estrutura

- `index.html` – página
- `styles.css` – estilos (Neo-Brutalismo suave, mobile-first)
- `script.js` – menu, animações de scroll, carrosséis, galeria com filtros, lightbox e avaliações
- `image_b34aba.jpg` – logo; `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` – ícones
- `*.jpg` – fotos dos trabalhos

## Avaliações

As avaliações ficam na lista `REVIEWS` em `script.js`. Adicione apenas avaliações reais.

A lista `EXAMPLE_REVIEWS` contém depoimentos **fictícios** usados só para apresentar o layout. Eles aparecem apenas com `?exemplo` no endereço e sempre com a etiqueta "Exemplo". Remova a lista quando houver avaliações reais suficientes.

## Atualizar cache

Ao alterar `styles.css` ou `script.js`, aumente o `?v=` nos links do `index.html`.
