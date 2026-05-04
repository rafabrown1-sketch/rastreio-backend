import express from "express";
import fetch from "node-fetch";

const app = express();

const API_KEY = "SEU_TOKEN_17TRACK";

app.get("/rastreio/:codigo", async (req, res) => {
  const codigo = req.params.codigo;

  try {
    // 🔥 TENTA 17TRACK
    let response = await fetch("https://api.17track.net/track/v2/GetTrackInfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "17token": API_KEY
      },
      body: JSON.stringify({
        number: [codigo]
      })
    });

    let data = await response.json();

    let eventos = data.data?.[0]?.track_info?.tracking || [];

    // 🔥 FALLBACK (se vazio)
    if (!eventos || eventos.length === 0) {
      console.log("⚠️ 17TRACK vazio, tentando fallback...");

      const fallback = await fetch(`https://proxyapp.correios.com.br/v1/sro-rastro/${codigo}`);
      const fallbackData = await fallback.json();

      eventos = fallbackData.objetos?.[0]?.eventos || [];
    }

    const eventosFormatados = eventos.map(ev => ({
      descricao: ev.status_description || ev.descricao || "Atualização",
      data: ev.time?.split(" ")[0] || ev.dtHrCriado?.split("T")[0],
      hora: ev.time?.split(" ")[1] || ev.dtHrCriado?.split("T")[1]?.substring(0,5),
      local: ev.location || (ev.unidade?.endereco?.cidade + " / " + ev.unidade?.endereco?.uf)
    }));

    res.json({
      codigo,
      status: eventosFormatados[0]?.descricao || "Sem atualização",
      eventos: eventosFormatados
    });

  } catch (error) {
    res.json({ erro: "Erro ao rastrear" });
  }
});

app.listen(3000, () => console.log("Servidor rodando 🚀"));
