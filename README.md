# Textor – Serviços Residenciais

Landing page da Textor: montagem de móveis, instalações e pintura, ar-condicionado, drywall e redes de proteção para pets.

Site estático (HTML + CSS + JavaScript puro), sem build.

## Rodar localmente

```bash
python3 -m http.server 5178
```

Abra `http://localhost:5178`.

## Estrutura

```
index.html                      página (fica na raiz para o GitHub Pages)
assets/
  css/styles.css                estilos (Neo-Brutalismo suave, mobile-first)
  js/script.js                  menu, animações, carrosséis, galeria, lightbox e avaliações
  img/
    brand/logo-textor.jpg       logo
    favicon/                    favicon.ico, favicon-32.png, apple-touch-icon.png
    servicos/
      redes-de-protecao/        fotos por serviço
      montagem-e-instalacoes/
      ar-condicionado/
      drywall-e-pintura/
    extras/                     fotos guardadas que não aparecem no site
```

## Avaliações

As avaliações ficam na lista `REVIEWS` em `assets/js/script.js`. Adicione apenas avaliações reais.

A lista `EXAMPLE_REVIEWS` contém depoimentos **fictícios** usados só para apresentar o layout. Eles aparecem apenas com `?exemplo` no endereço e sempre com a etiqueta "Exemplo". Remova a lista quando houver avaliações reais suficientes.

## Atualizar cache

Ao alterar o CSS ou o JS, aumente o `?v=` nos links do `index.html`.
