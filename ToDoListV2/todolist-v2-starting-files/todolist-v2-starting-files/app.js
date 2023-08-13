//jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = {
  name: String,
};

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: 'Welcome to your todolist!',
});

const item2 = new Item({
  name: 'Hit the + button to add a new item.!',
});

const item3 = new Item({
  name: '<-- Hit this to delete and item.',
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model('List', listSchema);

const homePage = async (req, res) => {
  try {
    let foundItems = await Item.find({});

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect('/');
    } else {
      res.render('list', { listTitle: 'Today', newListItems: foundItems });
    }
  } catch (err) {}
};

app.get('/:customListName', async (req, res) => {
  try {
    const customListName = _.capitalize(req.params.customListName);

    const foundList = await List.findOne({ name: customListName });

    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });

      list.save();

      res.redirect(`/${customListName}`);
    } else {
      res.render('list', {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/', function (req, res) {
  homePage(req, res);
});

app.post('/', async (req, res) => {
  try {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName,
    });

    if (listName === 'Today') {
      item.save();
      res.redirect('/');
    } else {
      const foundList = await List.findOne({ name: listName });

      foundList.items.push(item);
      foundList.save();

      res.redirect(`/${listName}`);
    }
  } catch (err) {
    console.log(err);
  }
});

app.post('/delete', async (req, res) => {
  try {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === 'Today') {
      await Item.findByIdAndRemove(checkedItemId);

      res.redirect('/');
    } else {
      await List.findOneAndUpdate(
        { name: listName },
        { $pull: { items: { _id: checkedItemId } } }
      );
      res.redirect(`/${listName}`);
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/about', function (req, res) {
  res.render('about');
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});