# Risorse Native Windows (x86_64-pc-windows-msvc)

Questa cartella contiene esclusivamente i binari Windows x64 per il packaging NSIS:
- `llama-server.exe` (OpenAI-compatible server per inferenza locale)
- `llama.dll` (libreria core llama.cpp)
- `ggml.dll`, `ggml-base.dll`, `mtmd.dll` (primitive tensoriali)
- `ggml-vulkan.dll` (backend GPU Vulkan standard)
- `ggml-cpu-*.dll` (backend CPU ottimizzati per diverse microarchitetture)

I file binari pesanti sono ignorati da git e vengono verificati e preparati dallo script di packaging per Windows (`scripts/package-v6mini-windows.ps1`).
Tutti i componenti macOS (`.dylib`, `.so`, Mach-O) sono esclusi per evitare file superflui o falsi positivi antivirus sul pacchetto Windows.
