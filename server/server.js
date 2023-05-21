const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Accounts = require('web3-eth-accounts');
const accounts = new Accounts();
const web3 = require('web3');
const session = require('express-session');
const app = express();
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true, // enable passing cookies across different domains
};

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    rolling: true,
    cookie: {
        // Session expires after 1 hour of inactivity
        maxAge: 60 * 60 * 1000,
        // ...
    }}));
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, '../build')));

app.get('/', (req, res) => {
    /*    const indexPath = path.join(__dirname, '../public/index.html');
        res.sendFile(indexPath);*/
    res.sendFile(path.join(__dirname, '../build', 'index.html'));

});

const ethUtil = require('ethereumjs-util');

app.post('/api/auth', async (req, res) => {
    // Extract user data from the request body
    const { provider, userAddress, signature } = req.body;


    if (provider === 'metamask') {
         // Verify the signature
        const message = 'Authentication message';
        try {
            // Recover the address from the signature
            const recoveredAddress = accounts.recover(message, signature);

            // Compare the recovered address with the user's provided address
            if (recoveredAddress.toLowerCase() === userAddress.toLowerCase()) {
                // Authentication successful
                // Store the wallet address in the user's session
                req.session.walletAddress = userAddress;

                res.send({ message: 'Metamask Authentication successful' });
            } else {
                res.status(401).send({ message: 'Metamask Authentication failed: Invalid signature' });
            }
        } catch (error) {
            console.log(error);
            res.status(400).send({ message: 'Metamask Authentication failed' });
        }
    }
        else {
        // Authentication failed
        res.status(401).send({ error: "Authentication failed. Invalid provider" });
    }
});

app.get('/api/user', (req, res) => {
    // Retrieve the wallet address from the user's session
    const walletAddress = req.session.walletAddress;

    if (!walletAddress) {
        // No wallet address found in the session
        res.status(401).send({ error: "User not authenticated" });
        return;
    }

    // Respond with user information
    res.send({ user: walletAddress });
});

app.post('/submitProposal', (req, res) => {
    console.log(req.body);
    if (!req.body) {
        return res.status(400).json({ status: 'Failed' });
    }
    return res.status(200).json({ status: 'Proposal received' });
});

app.listen(8000, () => {
    console.log('Server listening on port 8000');
});