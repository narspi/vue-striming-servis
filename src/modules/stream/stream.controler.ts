import { Router } from "express";
import WebTorrent from "webtorrent";

//8EFAEEA10552EEE1A335676AF72C831272AB8E93

const router = Router();
const client = new WebTorrent();

let state = {
  progress: 0,
  downloadSpeed: 0,
  ratio: 0,
};

client.on("error", (err) => {
  console.log("client error ", err);
});

client.on("torrent", () => {
  console.log("progerss: ", client.progress);
  state = {
    progress: Math.round(client.progress * 100 * 100) / 100,
    downloadSpeed: client.downloadSpeed,
    ratio: client.ratio,
  };
});

router.get("/add/:magnet", (req, res) => {
  const magnet = req.params.magnet;
  console.log("magenet id: ", magnet);
  client.add(magnet, (torrent) => {
    const files = torrent.files.map((data) => ({
      name: data.name,
      length: data.length,
    }));

    res.status(200).send(files);  
  });
});

interface RangeError extends Error {
  status: number;
}

router.get("/:magnet/:filename", async (req, res, next) => {
  const {
    params: { magnet, filename },
    headers: { range }
  } = req;
  console.log(magnet);
  console.log(filename);

  if (!range) {
    const error = new Error('range is not define') as RangeError;
    error.status = 416;
    return next(error);
  }

  const torrentFile = await client.get(magnet) as WebTorrent.Torrent;
  if (!torrentFile) throw new Error('error');
  if (!torrentFile) {
    res.status(500).send("Error 500");
  } else {
    let file = {} as WebTorrent.TorrentFile;
    for (let i = 0; i < torrentFile.files.length; i++)   {
      const currentTorrentPiece = torrentFile.files[i];
      if (currentTorrentPiece.name === filename) file = currentTorrentPiece;
    };

    const filesize = file.length;
    // console.log(file);
    // console.log(range);
    const [startParsed, endParsed] = range.replace(/bytes=/, '').split('-');

    const start = Number(startParsed);
    const end = endParsed? Number(endParsed) : filesize - 1;

    const chunkSize = end - start + 1;

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${filesize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4"
    };

    res.writeHead(206, headers);

    const streamPositions = {
      start,
      end
    }

    const stream = file.createReadStream(streamPositions);

    stream.pipe(res);

    stream.on('error',(err)=>{
      next(err)
    })
  }
});

router.get("/stats", (req, res) => {
  state = {
    progress: Math.round(client.progress * 100 * 100) / 100,
    downloadSpeed: client.downloadSpeed,
    ratio: client.ratio,
  };
  res.status(200).send(state);
});

export default router;
