const { ApolloServer, UserInputError, gql } = require('apollo-server');
const { v1: uuid, v1 } = require('uuid');

let authors = [
	{
		name: "Robert Martin",
		id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
		born: 1952,
	},
	{
		name: "Martin Fowler",
		id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
		born: 1963,
	},
	{
		name: "Fyodor Dostoevsky",
		id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
		born: 1821,
	},
	{
		name: "Joshua Kerievsky", // birthyear not known
		id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
	},
	{
		name: "Sandi Metz", // birthyear not known
		id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
	},
]

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
*/

let books = [
	{
		title: "Clean Code",
		published: 2008,
		author: "Robert Martin",
		id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
		genres: ["refactoring"]
	},
	{
		title: "Agile software development",
		published: 2002,
		author: "Robert Martin",
		id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
		genres: ["agile", "patterns", "design"]
	},
	{
		title: "Refactoring, edition 2",
		published: 2018,
		author: "Martin Fowler",
		id: "afa5de00-344d-11e9-a414-719c6709cf3e",
		genres: ["refactoring"]
	},
	{
		title: "Refactoring to patterns",
		published: 2008,
		author: "Joshua Kerievsky",
		id: "afa5de01-344d-11e9-a414-719c6709cf3e",
		genres: ["refactoring", "patterns"]
	},
	{
		title: "Practical Object- Oriented Design, An Agile Primer Using Ruby",
		published: 2012,
		author: "Sandi Metz",
		id: "afa5de02-344d-11e9-a414-719c6709cf3e",
		genres: ["refactoring", "design"]
	},
	{
		title: "Crime and punishment",
		published: 1866,
		author: "Fyodor Dostoevsky",
		id: "afa5de03-344d-11e9-a414-719c6709cf3e",
		genres: ["classic", "crime"]
	},
	{
		title: "The Demon",
		published: 1872,
		author: "Fyodor Dostoevsky",
		id: "afa5de04-344d-11e9-a414-719c6709cf3e",
		genres: ["classic", "revolution"]
	},
];

const typeDefs = gql`
  type Author {
	  name: String!
	  id: ID!
	  born: String
	  bookCount: Int!
  }

  type Book {
	  title: String!
	  published: String!
	  author: String!
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
		  published: String!
		  genres: [String!]!
	  ) : Book
	  editAuthor(
		  name: String!
		  setBornTo: String!
	  ) : Author
  }
`;

const resolvers = {
	Query: {
		authorCount: () => authors.length,
		bookCount: () => books.length,
		allBooks: (root, args) => {
			if (args.author) {
				return books.filter((book) => book.author === args.author);
			}
			if (args.genre) {
				return books.filter((book) => book.genres.find((b) => b === args.genre));
			}
			if (args.author && args.genre) {
				return books.filter((book) => book.author === args.author && book.genres.find((el) => el === args.genre));
			} else {
				return books;
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
	console.log(`Server ready at ${url}`)
});

