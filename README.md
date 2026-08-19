# Automação CNPJ — Versão Web (Next.js / Vercel)
**by Leonardo Martelli**

Migração do app original em Go (`Consulta CNPJ.exe`) para uma versão 100%
web.

- Login com senha
- Upload de planilha `.xlsx` e leitura da coluna `CNPJ`
- Consulta cadastral (BrasilAPI, com fallback para CNPJ.ws)
- Consulta Simples Nacional / SIMEI
- Barra de progresso e tabela de resultados em tempo real
- Botão "Parar" (cancelar consulta em andamento)
- Exportar Excel (com as mesmas cores condicionais por status) e CSV
- Tema claro/escuro

---


