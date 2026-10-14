# Voz natural da Ritinha — SoulKids
Atualização: 14 de outubro de 2026.

## Identidade aprovada
- Estilo escolhido pelo usuário: **terceira amostra**, voz feminina jovem "Pip", alegre, acolhedora, áudio sintetizado com pronúncia configurada para português brasileiro.
- A amostra escolhida é usada diretamente no convite inicial do Jardim do Movimento.
- Outros sete convites curtos usam a mesma voz e estilo; não são clones da voz de uma pessoa real.

## Onde está
- Player compartilhado: `/ritinha-voz.js`.
- Casa das Emoções: `/casa-das-emocoes.html` e `/casa-das-emocoes.js`.
- Jardim do Movimento: `/jardim-do-movimento.html` e `/jardim-do-movimento.js`.
- Os arquivos MP3 são permanentes no site sob `/audios/ritinha-*.mp3`, sem depender de URLs externas que expiram.

## Oito convites
| Arquivo | Situação |
| --- | --- |
| ritinha-jardim-entrada.mp3 | Boas-vindas ao Jardim (terceira amostra aprovada) |
| ritinha-casa-entrada.mp3 | Boas-vindas à Casa das Emoções |
| ritinha-casa-espelho.mp3 | Espelho das Emoções |
| ritinha-casa-calma.mp3 | Cantinho da Calma |
| ritinha-casa-historias.mp3 | Histórias da Turma |
| ritinha-jardim-trilha.mp3 | Trilha dos Movimentos |
| ritinha-jardim-espelho.mp3 | Espelho do Corpo |
| ritinha-jardim-ritmo.mp3 | Bosque do Ritmo |

## Experiência
- Um botão **Ouvir a Ritinha** acompanha o guia de cada página; o áudio selecionado corresponde ao cantinho ativo.
- Não há reprodução automática. Cada MP3 é carregado apenas quando solicitado, com `preload=none`.
- Tocar novamente interrompe o áudio. Trocar de atividade, iniciar o áudio de outra função, ocultar a aba ou sair da página também interrompe.
- O botão usa estado acessível `aria-pressed` e alterna texto para **Parar a Ritinha** durante a reprodução.
- **Segunda etapa concluída**: mais 48 gravações da mesma voz, armazenadas localmente:
  - 18 propostas do Jardim do Movimento (6 em cada estação)
  - 15 situações do Espelho das Emoções (3 por emoção)
  - 5 histórias e 10 respostas às escolhas da turma
- Os botões de escuta dos dois ambientes usam somente arquivos MP3 aprovados, sem `speechSynthesis` do navegador.
- No Bosque do Ritmo, **Ouvir a proposta** reproduz a fala; **Ouvir o ritmo** conserva o padrão sonoro interativo.
- Nas histórias, a introdução é reproduzida primeiro e a resposta escolhida em seguida, sem sobrepor narrações.
- O catálogo `/audios/ritinha-falas.json` registra o texto e o nome de cada arquivo.
- Ao todo são 56 MP3s (8 convites originais + 48 falas).
- Os convites pré-gravados não geram cobrança por reprodução; novos áudios exigem nova síntese pontual.
- Para atualizar um texto narrado, atualize o catálogo, a fala exibida e o MP3 correspondente antes de publicar.

## Validação
- Conferir volume e pronúncia no Android e no iPhone, carregamento em redes móveis, cliques repetidos, troca de estação e funcionamento com voz do navegador indisponível.
- Preservar o consentimento de reprodução por toque e o acesso às atividades sem áudio.
