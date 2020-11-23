const { ApolloServer, UserInputError, gql } = require('apollo-server');
const { v1: uuid, v1 } = require('uuid');
const mongoose = require('mongoose');

const Author = require('./models/author');
const Book = require('./models/book');

const connection = require('./utils/connection');

/*
If you create a user in the admin databse  then you can use the libe below with authSource being in tha admin db
const MONGODB_URL = `mongodb://${connection.MONGO_USERNAME}:${connection.MONGO_PASSWORD}@${connection.MONGO_HOSTNAME}:${connection.MONGO_PORT}/${connection.MONGO_DB}?authSource=admin`;
if You create a db somewhere else then the line above should not include the authSource
*/

const MONGODB_URL = `mongodb://${connection.MONGO_USERNAME}:${connection.MONGO_PASSWORD}@${connection.MONGO_HOSTNAME}:${connection.MONGO_PORT}/${connection.MONGO_DB}`;

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
	.then(() => {
		console.log("connected to mongDB");
	})
	.catch((error) => {
		console.log("aaaw shit. Here we go again -> ", error.message);
		console.log(MONGODB_URL);
	});


//graphql type definations
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
	  allBooks(author: String, genre: String): [Book]!
	  allAuthors: [Author!]!
  }
  type Mutation {
	  addBook(
		  title: String!
		  author: String!
		  published: Int!
		  genres: [String!]!
	  ) : Book
	  editAuthor(
		  name: String!
		  setBornTo: Int!
	  ) : Author
  }
`;

const resolvers = {
	Query: {
		authorCount: () => Author.collection.countDocuments(),
		bookCount: () => Book.collection.countDocuments(),
		allBooks: (root, args) => {
			if (args.author) {
				// return books.filter((book) => book.author === args.author);
			}
			if (args.genre) {
				// return books.filter((book) => book.genres.find((b) => b === args.genre));
			}
			if (args.author && args.genre) {
				// return books.filter((book) => book.author === args.author && book.genres.find((el) => el === args.genre));
			} else {
				return Book.find({});
			}
		},
		allAuthors: () => authors,
	},
	Author: {
		bookCount: (root) => {
			return books.filter((b) => b.author === root.name).length
		}
	},
	Mutation: {
		addBook: (root, args) => {
			//making sure a book is not added twice
			if (books.find((b) => b.title === args.title)) {
				throw new UserInputError('Book already exists', {
					invalidArgs: args.title,
				});
			}

			const book = { ...args, id: uuid() };
			books = books.concat(book);

			//if new book being added contains an author not in system save him/her
			if (authors.find((b) => b.author !== book.author)) {
				const new_author = { name: book.author, }
				authors = authors.concat(new_author);
			}

			return book;
		},
		editAuthor: (root, args) => {
			let author = authors.find((a) => a.name === args.name);

			if (!author) {
				return null;
			}

			const updated_author = { ...author, born: args.setBornTo };
			author = authors.map((a) => a.name === args.name ? updated_author : a);
			return updated_author;
		}
	}
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

server.listen().then(({ url }) => {
	console.log(`graphql server ready at ->  ${url}`)
});

