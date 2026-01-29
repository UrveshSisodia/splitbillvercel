import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

const splitSchema = new mongoose.Schema({
    amount: Number,
    payer: String,
    date: { type: Date, default: Date.now },
    members: [{
        name: String,
        share: Number,
        requested: { type: Boolean, default: false }
    }]
});

const Split = mongoose.models.Split || mongoose.model('Split', splitSchema);

const connectToDatabase = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        const uri = "mongodb+srv://urveshsisodia123_db_user:wPCouKHK9f3uWIVA@cluster0.gwd1sxa.mongodb.net/?appName=Cluster0";
        await mongoose.connect(uri);
        console.log("✅ Database Connected");
    } catch (err) {
        console.error("❌ Database Error:", err);
        throw err;
    }
};

app.post('/api/split', async (req, res) => {
    try {
        await connectToDatabase();

        if (!req.body.amount || !req.body.payer) {
            return res.status(400).json({ error: "Please provide amount and payer name" });
        }

        var total = Math.floor(Number(req.body.amount));
        var main = req.body.payer;
        var ID = req.body.friends || req.body.Id || [];

        var all_users = [];
        all_users.push({ name: main });

        for (var i = 0; i < ID.length; i++) {
            var fName = ID[i].name ? ID[i].name : ID[i];
            all_users.push({ name: fName });
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

    } catch (err) {
        console.error("Error ", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

export default app;