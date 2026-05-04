import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/rastreio", async (req, res) => {
  const codigo = req.query.codigo;

  if (!codigo) {
    return res.json({ erro: "Código não informado" });
  }

  try {
    const response = await fetch(`https://proxyapp.correios.com.br/v1/sro-rastro/${codigo}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://rastreamento.correios.com.br/"
      }
    });

    const data = await response.json();

    const eventos = (data.objetos?.[0]?.eventos || []).map(ev => ({
      data: ev.dtHrCriado?.split("T")[0],
      hora: ev.dtHrCriado?.split("T")[1]?.substring(0,5),
      local: ev.unidade?.endereco?.cidade + " / " + ev.unidade?.endereco?.uf,
      status: ev.descricao
    }));

    res.json({ codigo, eventos });

  } catch (error) {
    res.json({ erro: "Falha ao rastrear" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});
