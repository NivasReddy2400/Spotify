const express = require('express');
const axios = require('axios');
const fetch = require('node-fetch')

const app = express();
const port = 3000;

const client_id = "12cd9bc4731d4da6814f1b9f20c2e9cb";
const client_secret = "1950f593870c432d941914b3dc057627";


app.get('/', (req, res) => {
  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: {
      grant_type: 'client_credentials'
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(client_id + ':' + client_secret).toString('base64')
    }
  })
    .then(response => {
      console.log(response.data.access_token);
      
    })
    .catch(error => {
      console.log(error);
    });

  res.send('successful response received!');
});


app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const authOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        'your-client-id:your-client-secret'
      ).toString('base64')}`,
    },
    body: querystring.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'http://localhost:3000/callback',
    }),
  };

  try {
    const response = await fetch(
      'https://accounts.spotify.com/api/token',
      authOptions
    );
    const data = await response.json();
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.redirect('/login');
  }
});

app.get('/user', async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  try {
    const response = await fetch('https://api.spotify.com/v1/me', options);
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.log(error);
    res.redirect('/login');
  }
});

app.listen(port, () => console.log(`Express app listening on port ${port}!`));