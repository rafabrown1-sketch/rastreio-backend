import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/rastreio", async (req, res) => {
  const codigo = req.query.codigo;

  if (!codigo) {
    return res.json({ erro: "Código não informado" });
  }

  try {
    const response = await fetch("https://api.17track.net/track/v2/GetTrackInfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "17token": "85DB9B2C3F9DD5921DBA05E25B82FDAC"
      },
      body: JSON.stringify({
        number: [codigo]
      })
    });

    const data = await response.json();

    const eventos = data.data[0].track_info.tracking.map(ev => ({
      data: ev.time,
      status: ev.status_description,
      local: ev.location
    }));

    res.json({ codigo, eventos });

  } catch (error) {
    res.json({ erro: "Erro ao rastrear" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando");
});
