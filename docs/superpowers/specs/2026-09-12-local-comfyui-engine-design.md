# Spec: Infraestrutura Local de IA com ComfyUI Portable na RTX 5060

**Data:** 2026-09-12  
**Status:** Aprovado para Implementação  
**Autor:** Antigravity AI Pair Programmer & Filipe

---

## 1. Visão Geral e Objetivos
O objetivo deste subsistema é habilitar a geração 100% offline, local e gratuita de ensaios fotográficos de alta fidelidade com preservação rigorosa da identidade facial do cliente diretamente na placa de vídeo **NVIDIA GeForce RTX 5060 (8GB VRAM)** do usuário.

A solução é isolada, não poluente para o sistema operacional, e expõe uma API REST HTTP na porta `8188` que o **LensCraft Studio** consome nativamente.

---

## 2. Restrições e Hardware do Sistema
* **GPU:** NVIDIA GeForce RTX 5060 (8GB VRAM GDDR6, 145W, CUDA 13.4, Driver 616.92).
* **Armazenamento:** `C:\` com 841 GB livres.
* **Sistema:** Windows 11 64-bit.
* **Diretório de Instalação:** `C:\LensCraft-Local\ComfyUI_windows_portable`.

---

## 3. Arquitetura do Subsistema

```
┌────────────────────────────────────────┐
│   LensCraft Studio (Next.js 14)        │
│   http://localhost:3000                │
└──────────────────┬─────────────────────┘
                   │
                   │ HTTP REST (/prompt, /history, /view)
                   ▼
┌────────────────────────────────────────┐
│   ComfyUI Portable (Porta 8188)        │
│   • Python 3.11 Embutido               │
│   • PyTorch 2.x + CUDA 12/13           │
│   • Modelos: SDXL Photorealism         │
│   • Preservação Facial: FaceID/ReActor │
└──────────────────┬─────────────────────┘
                   │ VRAM Management (--lowvram / --medvram)
                   ▼
┌────────────────────────────────────────┐
│   NVIDIA GeForce RTX 5060 (8GB VRAM)   │
└────────────────────────────────────────┘
```

---

## 4. Componentes a Instalar
1. **ComfyUI Windows Portable (NVIDIA):**
   * Download do arquivo oficial `.7z` (~1.8 GB).
   * Extração com `7zr.exe` para `C:\LensCraft-Local\`.
2. **Nó de Preservação Facial (ReActor / IP-Adapter FaceID):**
   * Clonagem do nó customizado no diretório `custom_nodes`.
   * Download dos modelos de detecção facial (InsightFace buffalo_l).
3. **Checkpoint Fotográfico Otimizado:**
   * Modelo SDXL ou SD 1.5 Photorealism calibrado para memória de 8GB (como Juggernaut ou Realistic Vision).
4. **Integração no LensCraft Studio (`local.ts`):**
   * Envio do workflow JSON para `http://127.0.0.1:8188/prompt`.
   * Upload da foto do rosto do cliente via multipart `/upload/image`.
   * Polling de `/history/{prompt_id}` até a conclusão.
   * Retorno da imagem gerada renderizada diretamente no frontend do estúdio.
