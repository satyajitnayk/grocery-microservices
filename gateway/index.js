const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/customer', proxy('http://localhost:8001')); // customer
app.use('/shopping', proxy('http://localhost:8003')); //shopping
app.use('/', proxy('http://localhost:8002')); //products

app.listen(8000, () => {
  console.log(`Gateway is listening on port 8000`);
});
