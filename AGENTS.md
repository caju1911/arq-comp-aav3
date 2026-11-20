# AGENTS.md — arqcomp-termo

Instruções para agentes de IA (Claude Code, Codex, Cursor etc.) que trabalharem neste repositório.

## Contexto do projeto

Jogo de **Adivinhação de Palavras estilo Termo / Wordle de Arquitetura Computacional** que roda no navegador, baseado na *Atividade Avaliativa III — Game* (Sprint 3, disciplina Arquitetura Computacional, SPTECH). Trabalho **individual**, entregue no Moodle apenas com o **link do site publicado** no GitHub Pages.

O objetivo é a aluna praticar e fixar os conceitos ao escrever as pistas. O agente deve **ajudar a construir e revisar, sem fazer tudo sozinho nem substituir o raciocínio dela**.

## Stack e restrições

- **HTML, CSS e JavaScript puros.** Sem frameworks, bibliotecas, bundlers ou dependências externas.
- `index.html` **na raiz** do projeto.
- Caminhos **relativos** (`style.css`, `script.js`) para funcionar direto no navegador e no GitHub Pages.
- Tudo local, sem backend, banco de dados ou APIs externas.
- Textos da interface, pistas e README em **português do Brasil**.
- Não colocar RA, e-mail, telefone ou dados pessoais no repositório.

## Estrutura de arquivos

```text
arqcomp-termo/
├── index.html   # estrutura da página (pista, grid de tentativas, teclado, contador, botões)
├── style.css    # estilização e estados visuais das letras
├── script.js    # palavras + pistas, lógica do jogo e validação
├── README.md    # nome do jogo, como jogar, palavras + pistas e link do site
└── AGENTS.md    # este arquivo
Manter a estrutura simples, sem criar pastas ou arquivos extras desnecessários.

## Palavras permitidas
Usar as 16 palavras abaixo. Grafia no jogo: MAIÚSCULAS, sem acento e sem espaço.

Nº	Termo	No jogo
1	CPU	CPU
2	ULA	ULA
3	UC (Unidade de Controle)	UC
4	registradores	REGISTRADORES
5	RAM	RAM
6	ROM	ROM
7	EEPROM	EEPROM
8	Flash	FLASH
9	cache	CACHE
10	memória de massa (armazenamento)	MEMORIADEMASSA
11	DMA	DMA
12	address bus (barramento de endereço)	ADDRESSBUS
13	data bus (barramento de dados)	DATABUS
14	microcontrolador	MICROCONTROLADOR
15	dual core	DUALCORE
16	quad core	QUADCORE

## Regras das pistas
Escritas por vocêrefaça isso tudo, e também coloque as dicas , com no máximo 15 palavras cada.

Não conter a resposta, parte dela nem a sigla por extenso.

Estar corretas segundo o material da disciplina e apontar para uma única resposta.

## Requisitos do jogo
Exibir a pista da palavra atual e o progresso da rodada.

Gerar as linhas de tentativa com o número de casas correspondente ao tamanho da palavra secreta.

Permitir digitar pelo teclado (A–Z, Backspace e Enter), convertendo para maiúscula.

Validar a tentativa ao enviar (botão Conferir ou Enter): posição certa, letra em outra posição e letra ausente.

Permitir avançar para a Próxima Palavra ao fim da rodada e exibir o resultado.

Mostrar contador de acertos (ex.: 8 de 12 palavras).

Botão Reiniciar para recomeçar a partida.

Feito em HTML, CSS e JS puros, com index.html na raiz.

## Organização do código
Centralizar as palavras e pistas em um array em script.js e renderizar o grid dinamicamente.

Adaptar o tamanho das casas no CSS para palavras longas caberem bem em telas menores.

Usar mais de um recurso visual (além da cor) para diferenciar os estados das letras.