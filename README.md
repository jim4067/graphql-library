# graphql library

Using MongoDB locally on my machine

## running mongodb locally

make sure that you have mongodb installed and setup on your machine

Check whether the mongodb is running

```
systemctl status mongod
```

The following will save you from breaking your monitor and keyboard because of programmer's furry so pay close attention.

go into the mongo shell
Once in, list the databases that are on your machine using _show dbs_ and you will see that there are admin, config and local. I believe that these are part of every MongoDB cluster.

Since there is no _createDB_ command in the mongo shell you will have to work with the _use_ command. It does exactly what the name says, but if you use it with a database that does not exist, then that database will automatically be created for you.

Here is the tricky bit. Although your databse has been created, It does not yet 'fully exit'. If you list the databases on the machine
you'll be shocked that it does not exist. To make it permanent, you'll will first have to populate it with data 
using the _db.collection-name.insert_

See example below for more insight.

```
list db's on your machine
>show dbs
create new database if it does exist 
> use library-db 
populate the database with data 
db.authors.insert({ name: "Robert Martin", id: "afa51ab0-344d-11e9-a414-719c6709cf3e", born: 1952, })

```

create the default config file that you will use to connect to your database, not necessary but I prefer this method incase your project grows and you start refactoring it.
