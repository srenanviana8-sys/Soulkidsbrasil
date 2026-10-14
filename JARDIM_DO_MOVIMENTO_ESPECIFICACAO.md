# Jardim do Movimento — especificação técnica e visual

Projeto SoulKids, 14/10/2026. Escopo: segundo ambiente explorável do Mundo da Ritinha, dedicado à Psicomotricidade.

## Conceito visual e direção de arte
- Jardim acolhedor, sem competição, com céu azul, colinas, flores e caminho. Área principal ilustrada por CSS e SVG responsivos.
- Três estações visuais tocáveis: Trilha dos Movimentos, Espelho do Corpo e Bosque do Ritmo.
- A ilustração da turma existente no repositório é preservada. Personagens Ritinha, Luca, Tonico, Lia e Maya aparecem nas falas contextualizadas.
- A imagem conceitual gerada por IA NÃO é arte oficial: ela reimaginou rostos e características da turma. Não usar no site sem aprovação específica. Uma arte definitiva deve seguir os desenhos oficiais e a identidade de cada personagem.
- Tipografia arredondada e sistema legível; tons de verde, azul, creme e acentos florais; controles amplos com estados de foco e seleção.

## Arquitetura e páginas
- Entrada do mapa: mundo-da-ritinha.html → Jardim do Movimento.
- Página completa: jardim-do-movimento.html.
- Lógica da interação: jardim-do-movimento.js, sem dependências pagas.
- O jogo de psicomotricidade anterior, jogo-ritinha.html, permanece acessível.
- Três hotspots e três botões equivalentes abrem os mesmos painéis; o foco de teclado vai para o título.

## Conteúdos e roteiro
### Trilha dos Movimentos
Seis propostas: caminho de cores, ilhas de papel, caminho dos sentidos, siga a linha, pausa combinada e trilha inventada. Alternativas incluem apontar, representar em folha, escolher com gestos ou conduzir um brinquedo. Ritinha, Luca, Maya, Tonico e Lia participam por falas curtas.
### Espelho do Corpo
Seis propostas: braços para cima, mão na cabeça, um lado e outro, abrir e fechar, localizar o joelho e pose criada pela criança. A imitação não precisa ser exata. Adaptações para olhar, imaginar, usar desenhos, escolher ou fazer movimentos menores.
### Bosque do Ritmo
Seis sequências com figuras e palavras, explorando palmas, passos, pausa, som, lateralidade e toques. Som suave opcional apenas após toque no botão. Botão de parar e pausa quando sair da atividade ou ocultar a aba. Se o navegador não permitir áudio, a apresentação visual continua.

## Personagens e inclusão
- Ritinha guia, acolhe e apresenta.
- Luca adiciona brincadeira e humor, sem exagerar bordões.
- Tonico observa, aponta e escolhe, sem exigir fala oral.
- Lia expressa preferências e o direito de parar.
- Maya participa com opções acessíveis, incluindo organização espacial adequada.
- As atividades são educativas, não avaliações nem tratamentos e não pressupõem habilidade motora específica.

## Persistência, privacidade e acessibilidade
- Ao abrir uma área, registrar o carimbo simbólico movimento usando a chave local soulkids-mundo-ritinha-v1, preservando os registros anteriores; sem cadastro ou dados pessoais.
- Controle de som iniciado somente por ação explícita; sem câmera/microfone, sem IA infantil aberta.
- HTML semântico, acessível por teclado, aria-pressed, aviso de movimento reduzido; instruções curtas e adaptações claras.
- Orientar que um adulto acompanhe quando necessário e que espaços/movimentos sejam seguros e confortáveis.

## Critérios de aceite
1. Os seis jogos anteriores permanecem funcionando.
2. Cada hotspot e aba alternativa abre a atividade correspondente.
3. Seis propostas alternadas por atividade, com textos e adaptações.
4. Ritmo pode ser iniciado e interrompido; nunca toca automaticamente.
5. Passaporte preserva o histórico e marca Movimento.
6. Controle por teclado e redução de animações.
7. Arte da turma oficial reutilizada, sem personagens gerados inconsistentes.
8. Não exigir créditos Runway ou serviços pagos em tempo de execução.

## Próxima etapa editorial
Avaliar no celular proporção, legibilidade, localização de hotspots, clareza das falas e inclusão antes de encomendar ilustrações oficiais individualizadas.