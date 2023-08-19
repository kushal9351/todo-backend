const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const port = 3000;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: "Buy Food"
});
const item2 = new Item({
    name: "Cook Food"
});
const item3 = new Item({
    name: "Eat Food"
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);


const defalutItems = [item1, item2, item3];

app.get("/", async(req, res)=>{
    try{
        const foundItems = await Item.find({});
        if(foundItems.length === 0){
            await Item.insertMany(defalutItems);
            console.log("Successfully saved default items to DB.");
            res.redirect("/");
        }
        else{
            res.render("list.ejs", {listTitle: "Today", newListItems: foundItems});
        }
    }
    catch(err){
        console.log(err);
    }
});

app.post("/", async(req, res)=>{
    try{
        const itemName = req.body.newItem;
        const titleName = req.body.list;

        let it = new Item({
            name: itemName
        })

        if(titleName === "Today"){
            it.save();
            res.redirect("/");
        }
        else{
            const fO = await List.findOne({name: titleName});
            fO.items.push(it);
            fO.save();
            res.redirect("/" + titleName);
        }
    }
    catch(err){
        console.log(err);
    }
});

app.post("/delete", async(req, res)=>{

    try{
        const checkItemId = req.body.checkbox;
        const listName = req.body.listName;
        if(listName === "Today"){
            await Item.findByIdAndRemove(checkItemId);
            console.log("successfully deleted");
            res.redirect("/");
        }
        else{
            await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}})
            res.redirect("/" + listName);
        }
    }
    catch(err){
        console.log(err);
    }
})

app.get("/:customListName", async(req, res)=>{
    try{
        const customListName = _.capitalize(req.params.customListName);
        const fd = await List.findOne({name: customListName});
        if(fd == null){
            const list = new List({
                name: customListName,
                items: defalutItems
            });
            list.save();
            res.redirect("/"+ customListName);
        }
        else{
            res.render("list.ejs", {listTitle: fd.name, newListItems: fd.items});
        }
    }
    catch(err){
        console.log(err);
    }
});

app.listen(port, ()=>{
    console.log(`server started on port ${port}`);
})