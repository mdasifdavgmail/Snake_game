const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let highScore = 0;

app.get('/highscore', (req, res) => {
    res.json({ highScore });
});

app.post('/highscore', (req, res) => {
    const { score } = req.body;
    if (score > highScore) {
        highScore = score;
    }
    res.json({ highScore });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
