const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const fs  = require("fs");
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const app = express();
const csv = require('csv-parser');

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,              
  }));
app.use(cookieParser());
const PORT = 5000;
const path = require('path');
const CREDENTIALS_PATH = path.resolve(__dirname, "../credentials/credentials.json");
const TOKEN_PATH = path.resolve(__dirname, "../token/token.json");
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  


if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error("File does not exist:", CREDENTIALS_PATH);
} else if (fs.lstatSync(CREDENTIALS_PATH).isDirectory()) {
    console.error("Path points to a directory, not a file:", CREDENTIALS_PATH);
} else {
    console.log("File exists and is valid:", CREDENTIALS_PATH);
}


function loadCredentials() {
    return JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
}

async function authorize(req) {
     const { client_secret, client_id, redirect_uris } = loadCredentials().web;
     const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    if (req.cookies?.['__session']&&req.cookies?.['__session'].expiry_date < new Date().getTime()) {
        oAuth2Client.setCredentials(req.cookies?.['__session']);
        return true
    } else {
        const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/gmail.readonly'] });
        console.log('Authorize this app by visiting this url:', authUrl);
        return authUrl;
    }
}
const prisma = new PrismaClient();
async function ParseData(csvData) {
    const users = [];

   
    const parseCSV = (data) => {
        return new Promise((resolve, reject) => {
            const results = [];
            require('stream')
                .Readable.from(data)
                .pipe(csv())
                .on('data', (row) => results.push(row))
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });
    };
    try {
        const parsedData = await parseCSV(csvData);
          
        const headers = Object.keys(parsedData[0]);

        for (const user of parsedData) {
            
            const userObject = {};
            headers.forEach(header => {
                userObject[header.trim()] = user[header];
            });

            users.push(userObject);
        }


        for (const user of users) {
            await prisma.user.create({
                data: user,
            });
        }
        console.log('CSV data imported successfully!');
    } catch (error) {
        console.error('Error processing CSV data:', error);
    } finally {
        await prisma.$disconnect();
    }
}
async function searchCsvEmails(auth) {
    
    try {
        const gmail = google.gmail({ version: "v1", auth: oauth2Client  });
        const query = "MOCK_DATA.csv:csv";
        const res = await gmail.users.messages.list({
            userId: "me",
            q: 'has:attachment'
        });
      console.log("Message List", res)
        const messages = res.data.messages || [];
        const results = [];
    
        for (const message of messages) {
            const msg = await gmail.users.messages.get({
                userId: "me",
                id: message.id,
                format: 'full' 
            });
    
           
            const parts = msg.data.payload.parts || [];
         
            for (const part of parts) {
               
                if (part.filename && part.body && part.body.attachmentId) {
                    const attachmentId = part.body.attachmentId;
                    console.log(attachmentId, "!!!!!")
                    const attachment = await gmail.users.messages.attachments.get({
                        userId: "me",
                        messageId: message.id,
                        id: attachmentId,  
                    });
    
           
                msg.data.payload.headers.find(header => header.name === "Subject")?.value == "Test Task Mock Data" &&
                    results.push({
                        id: message.id,
                        subject: msg.data.payload.headers.find(header => header.name === "Subject")?.value,
                        snippet: msg.data.snippet,
                        attachmentData: attachment.data.data 
                   });
                 }
            }
        }
        const buffer = Buffer.from(results[0].attachmentData, 'base64');
          await ParseData(buffer.toString())
      return  "Stored in  DB";

    } catch (error) {
        console.log("<<<error",error)
    }
   
}

app.get("/auth/login", async (req, res) => {
    try {
        const authUrl = await authorize(req);
        res.status(200).json({url : authUrl});
    } catch (error) {
        console.error(error);
        res.status(500).send("Error searching for emails");
    }
});
app.get("/auth/callback", async (req,res )=>{
    const { code } = req.query; 
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.cookie('__session', { token : tokens } ,{expires  : new Date(tokens.expiry_date),httpOnly: true} );
    return res.status(200).json({status: true})
});
app.get("/search-csv", async (req,res )=>{
  try {
     const auth = await authorize(req);
     console.log(auth)
     const emails = await searchCsvEmails(auth);
     return res.status(200).json(emails)
  } catch (error) {
     return res.status(500).json(error)
  }
});
app.get('/getData', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
