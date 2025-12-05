# PromptLab Studio

PromptLab Studio é uma aplicação web de página única que combina design de interface, ciência das cores e engenharia de prompts para gerar descrições claras e de alta qualidade para MidJourney, Stable Diffusion, DALL·E e modelos similares. A ferramenta ajuda a transformar ideias vagas em prompts estruturados no formato **[beginning] [middle] [end]**, prontos para serem usados em geradores de imagem.

## Principais recursos
- **Captura de ideia e contexto**: campo de entrada para a ideia inicial, acompanhado de chips de estilo e parâmetros técnicos organizados por categoria.
- **Roda de cores e paletas harmonizadas**: seleção principal de cor e geração automática de paletas análogas, complementares e triádicas para orientar o grading.
- **Construtor de prompt guiado**: junta sujeito + ação, estilo/ambiente e acabamento técnico (lentes, luz, proporção), evitando contradições entre modificadores.
- **Pré-visualização imediata**: bloco de saída pronto para copiar, com ênfase nas partes mais importantes do prompt.
- **Layout responsivo**: cartões, chips e swatches de cor com tipografia consistente, pensados para uso em desktop ou tablet.

## Pré-requisitos
- **Node.js 18+** (recomendado) e **npm** ou **pnpm** para instalar dependências.
- Navegador moderno para visualizar a aplicação.

## Instalação e execução local
1. Clone o repositório e entre na pasta do projeto:
   ```bash
   git clone <url-do-repo>
   cd PromptLab-Studio
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o ambiente de desenvolvimento com recarregamento automático:
   ```bash
   npm run dev
   ```
4. Gere o build de produção:
   ```bash
   npm run build
   ```
5. Opcional: pré-visualize o build localmente:
   ```bash
   npm run preview
   ```

> Se o gerenciador de pacotes não estiver disponível no ambiente, instale o Node/npm primeiro ou utilize um container com a stack Node já configurada.

## Estrutura do projeto
```
.
├─ index.html           # Shell de entrada do Vite
├─ src/
│  ├─ main.jsx          # Ponto de entrada React + hidratação
│  ├─ App.jsx           # Layout principal, seções e lógica de UI
│  └─ index.css         # Estilos globais, tokens e componentes visuais
└─ vite.config.js       # Configuração Vite com plugin React
```

## Como usar
1. Digite sua ideia no campo "Ideia vaga" (ex.: "astronauta tomando café").
2. Escolha a cor principal na roda e veja paletas harmonizadas para guiar o color grading.
3. Selecione shot type, ângulo de câmera, iluminação, estilo de roupa, ambiente e tempo.
4. Ajuste lentes/qualidade, proporção e negativos conforme necessário.
5. Clique em **Gerar prompt** e copie o resultado do painel de saída.

### Estrutura do prompt
O construtor segue o formato **[beginning] [middle] [end]**:
- **Beginning**: sujeito + ação principal.
- **Middle**: contexto e estilo (ângulo de câmera, movimento, emoção, composição, cor, ambiente, clima).
- **End**: polimento técnico (luz, lentes, qualidade, aspecto, negativos opcionais).

Exemplo:
```
A futuristic neon café barista serving coffee, medium shot, eye-level, cyber/futuristic streetwear, confident expression, subtle motion in steam, urban street at blue hour, neon color palette, rule of thirds, warm teal-and-orange glow — soft rim light with backlight accents, 85mm f1.8, ISO 200, 1/250, cinematic clarity, ar 3:4, negative: blurry, overexposed, text, extra fingers
```

## Boas práticas de edição
- Prefira descrições vívidas e concretas em 1–3 palavras por categoria.
- Evite contradições (ex.: low-key vs high-key; monocromático vs neon vibrante).
- Coloque modificadores mais importantes primeiro e mantenha o prompt em uma única linha para fácil cópia.

## Roteiro rápido de contribuição
1. Crie um branch de feature a partir da `main`.
2. Faça commits pequenos e descritivos.
3. Execute `npm run build` antes de abrir PRs para garantir que o bundle não quebre.
4. Descreva mudanças no README ou comentários do código quando relevante.

## Licença
Distribuído sob a licença MIT. Consulte o arquivo `LICENSE` (quando adicionado) para detalhes.
