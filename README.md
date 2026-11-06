# Yuny Parcerias · Portal do Corretor

Portal para corretores e imobiliárias parceiras da Yuny: empreendimentos, materiais de venda e contato com os gerentes de Parcerias.

## Estrutura

- `index.html`: o portal inteiro (página, estilos e dados)
- `img/`: fotos de capa dos empreendimentos
- `robots.txt`: pede aos buscadores para não indexar o site
- `.nojekyll`: faz o GitHub Pages servir os arquivos como estão

## Como atualizar

1. Abra `index.html` no GitHub e clique no lápis (Edit).
2. Os dados ficam no bloco `DADOS` (listas `GERENTES` e `EMPS`).
3. Clique em **Commit changes**. Em 1 ou 2 minutos o site atualiza.

## Link de cada gerente

`https://SEU-ENDERECO/#g-alberto` (troque pelo id: alberto, antonela, belluzzi, elano, peterson, ricardo).

Quem entra por esse link já vê o gerente como contato.

## Login ligado à planilha

Os cadastros ficam na planilha **"Cadastros do Portal Parcerias (PRIVADA)"** (só o dono acessa).
O código do servidor está em `apps-script/Codigo.gs`.

1. Abra a planilha privada > **Extensões > Apps Script**.
2. Apague o que estiver lá, cole o conteúdo de `Codigo.gs` e salve.
3. No topo, escolha a função **testar** e clique em **Executar**. Autorize com sua conta Google.
4. **Implantar > Nova implantação** > tipo **App da Web**. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**. Clique em Implantar.
5. Copie a URL (termina em `/exec`) e cole em `const API_URL = "";` no `index.html`.

Com `API_URL` vazio, o portal guarda o cadastro só no navegador (modo teste).
Se mudar o código depois: **Implantar > Gerenciar implantações > editar > Nova versão** (a URL continua a mesma).

Esqueceu a senha: apague a célula da coluna **O (Senha)** do corretor. Ele refaz o cadastro com o mesmo CPF.
