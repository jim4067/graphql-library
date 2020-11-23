const { ApolloServer, UserInputError, gql } = require('apollo-server');
const mongoose = require('mongoose');

const Author = require('./models/author');
const Book = require('./models/book');

const connection = require('./utils/connection');

const MONGODB_URL = `mongodb://${connection.MONGO_USERNAME}:${connection.MONGO_PASSWORD}@${connection.MONGO_HOSTNAME}:${connection.MONGO_PORT}/${connection.MONGO_DB}`;

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log("connected to mongDB");
    })
    .catch((error) => {
        console.log("aaaw shit. Here we go again -> ", error.message);
        console.log(MONGODB_URL);
    });

const typeDefs = gql`
    type Author {
        name: String!
	    id: ID!
	    born: String
	    bookCount: Int!
    }

    type Book {
	  title: String!
	  published: Int!
	  author: Author!
	  id: ID!
	  genres: [String!]!
  }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks: [Book!]!
        allAuthors: [Author!]!
    }
`;

const resolvers = {
    Query: {
        bookCount: () => Author.collection.countDocuments(),
        authorCount: () => Book.collection.countDocuments(),
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

server.listen().then(({ url }) => {
    console.log(`graphql running on port ${url}`);
});