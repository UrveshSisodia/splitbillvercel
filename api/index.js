const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://urveshsisodia123_db_user:Yyh6N38SS0Z3CtwZ@cluster0.gwd1sxa.mongodb.net/?appName=Cluster0')
    .then(() => console.log('Database Connected Successfully'))
    .catch((err) => console.log('Error:', err));

const splitSchema = new mongoose.Schema({
    amount: Number,
    payer: String,
    members: [{
        name: String,
        share: Number,
        requested: Boolean
    }]
});

const Split = mongoose.model('Split', splitSchema);

app.post('/split', async (req, res) => {
    try {
        if (!req.body.amount || !req.body.payer) {
            return res.status(400).json({ error: "Please provide amount and payer name" });
        }
        var total = parseInt(req.body.amount);
        var main = req.body.payer;
        var ID = req.body.Id;

        var all_users = [];

        all_users.push({ name: main });

        for (var i = 0; i < ID.length; i++) {
            all_users.push({ name: ID[i].name });
        }

        var count = all_users.length;
        var share = 0;
        var extra = 0;

        if (count > 0) {
            share = Math.floor(total / count);
            extra = total - (share * count);
        }

        var final_list = all_users.map((user, index) => {
            var my_share = share;

            if (index === 0) {
                my_share = share + extra;
            }

            return {
                name: user.name,
                share: my_share,
                requested: false
            };
        });

        const newEntry = new Split({
            amount: total,
            payer: main,
            members: final_list
        });

        await newEntry.save();

        res.json(final_list);
    }
    catch (err) {
        console.log("Error ", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(5000, () => {
    console.log("Server started on port 5000");
});