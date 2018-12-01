// mongodb+srv://Giz:<PASSWORD>@imageareauser-org0l.mongodb.net/test?retryWrites=true
const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://Giz:imagearea@imageareauser-org0l.mongodb.net/test?retryWrites=true";
MongoClient.connect(uri,{ useNewUrlParser: true }, function (err, client) {
    if(err){
        console.log("Error occurred while connecting to MongoDB Atlas...\n", err);
        return;
    }
    console.log("连接中……");
    const collection = client.db("image-area").collection("users");
    console.log(collection);
    client.close();
});

