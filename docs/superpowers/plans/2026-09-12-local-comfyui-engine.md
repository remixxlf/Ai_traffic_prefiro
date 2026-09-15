# Local ComfyUI Engine (RTX 5060) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instalar e configurar a infraestrutura de Inteligência Artificial local ComfyUI Portable na RTX 5060 (8GB VRAM) com preservação facial e conectar ao LensCraft Studio na porta 8188.

**Architecture:** ComfyUI Windows Portable instalado em `C:\LensCraft-Local\ComfyUI_windows_portable`, executando Python 3.11 embutido com PyTorch CUDA. O LensCraft Studio (`local.ts`) envia a foto do rosto para a API `/upload/image`, aciona o fluxo em `/prompt`, monitora em `/history` e exibe o resultado final com custo R$ 0,00.

**Tech Stack:** Python 3.11 Portable, PyTorch + CUDA, ComfyUI, ReActor / InsightFace FaceID, Next.js 14, TypeScript.

**Spec:** `docs/superpowers/specs/2026-09-12-local-comfyui-engine-design.md`

## Global Constraints
- Instalação isolada em `C:\LensCraft-Local\` sem alterar o registro do Windows.
- Otimização para 8GB VRAM utilizando flags de gerenciamento de memória (`--medvram` ou `--lowvram`).
- Porta do servidor: `http://127.0.0.1:8188`.
- A API do LensCraft Studio em `src/lib/image-engine/local.ts` consome a API REST oficial do ComfyUI.

---

### Task 1: Preparação do Diretório e Download do Utilitário de Extração

**Files:**
- Create: `C:\LensCraft-Local\tools\7zr.exe`

- [x] **Step 1: Criar diretório base**
Criar o diretório `C:\LensCraft-Local\tools` e baixar o utilitário `7zr.exe` para descompactação de alta performance.

- [x] **Step 2: Verificar funcionamento do 7zr**
Executar `7zr.exe` para confirmar que está pronto para descompactar o arquivo `.7z`.

---

### Task 2: Download do ComfyUI Windows Portable (NVIDIA)

**Files:**
- Download: `C:\LensCraft-Local\ComfyUI_windows_portable_nvidia.7z` (~1.8 GB)

- [x] **Step 1: Baixar pacote oficial do GitHub Releases**
Executar download com curl com barra de progresso para `C:\LensCraft-Local\ComfyUI_windows_portable_nvidia.7z`.

- [x] **Step 2: Validar integridade do arquivo baixado**
Conferir tamanho do arquivo baixado (> 1.8 GB).

---

### Task 3: Extração e Teste do Ambiente Python + CUDA na RTX 5060

**Files:**
- Extract to: `C:\LensCraft-Local\ComfyUI_windows_portable\`

- [x] **Step 1: Extrair o pacote com 7zr**
Descompactar o arquivo `.7z` na pasta de destino.

- [x] **Step 2: Testar detecção da RTX 5060 via PyTorch Embutido**
Executar comando com o `python.exe` embutido para verificar se o PyTorch detecta `torch.cuda.is_available() == True` e nomeia a placa como `NVIDIA GeForce RTX 5060`.

---

### Task 4: Instalação do Checkpoint Fotográfico e Nó de Preservação Facial

**Files:**
- Models: `C:\LensCraft-Local\ComfyUI_windows_portable\ComfyUI\models\checkpoints\`
- Custom Nodes: `C:\LensCraft-Local\ComfyUI_windows_portable\ComfyUI\custom_nodes\`

- [x] **Step 1: Instalar nó de Face Swap / Preservação Facial (ReActor)**
Clonar o repositório do nó customizado e baixar os modelos InsightFace essenciais.

- [x] **Step 2: Instalar checkpoint fotográfico otimizado**
Baixar checkpoint SDXL/SD 1.5 Photorealism de alta velocidade (ex: DreamShaper ou Realistic Vision).

---

### Task 5: Script de Inicialização e Serviço em Background

**Files:**
- Create: `scripts/start-comfyui.ps1`

- [x] **Step 1: Criar script PowerShell para inicialização da API**
Script que inicia o ComfyUI com `--listen 127.0.0.1 --port 8188 --medvram --preview-method auto`.

- [x] **Step 2: Iniciar servidor ComfyUI em background**
Executar e verificar se a rota `http://127.0.0.1:8188/system_stats` responde com status 200 OK e exibe a GPU RTX 5060.

---

### Task 6: Integração no LensCraft Studio (`local.ts`)

**Files:**
- Modify: `src/lib/image-engine/local.ts`

- [x] **Step 1: Implementar dispatchToComfyUI com envio de imagem e prompt**
Codificar upload da foto do rosto para `/upload/image`, montagem do workflow de inferência e polling em `/history`.

- [x] **Step 2: Testar rota `/api/generate/image` apontando para o ComfyUI ativo**
Enviar requisição real com uma foto de teste e verificar a geração da imagem pela GPU local.

---

### Task 7: Verificação e Validação na Interface

- [x] **Step 1: Verificar status no LensCraft Studio**
Abrir `http://localhost:3000` e conferir se o indicador mudou automaticamente para `Hardware Local (Sua RTX 5060 Conectada!)` com bolinha verde.

- [x] **Step 2: Executar ensaio fotográfico local com preservação facial**
Gerar ensaio com foto de rosto e validar que o output mantém a identidade da pessoa com tempo de geração de poucos segundos na RTX 5060.
