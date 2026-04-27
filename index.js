const express = require("express");
const cors = require("cors");
const https = require("https");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get("/news", (req, res) => {
  try {
    const { category, country, page, pageSize } = req.query;

    const options = {
      hostname: "newsapi.org",
      path: `/v2/top-headlines?language=en&category=${category}&page=${page}&pageSize=${pageSize}&apiKey=${process.env.NEWS_API_KEY}`,
      method: "GET",
      headers: {
        "User-Agent": "NewsMonkey/1.0",        // ✅ fixes userAgentMissing error
        "Accept": "application/json",
      },
    };

    console.log("Fetching:", options.path);

    const request = https.request(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          console.log("NewsAPI Status:", parsed.status);
          res.json(parsed);
        } catch (parseError) {
          console.error("Parse error:", parseError.message);
          res.status(500).json({ error: "Failed to parse response" });
        }
      });
    });

    request.on("error", (err) => {
      console.error("Request error:", err.message);
      res.status(500).json({ error: err.message });
    });

    request.end();

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});