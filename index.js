const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Definir el esquema de GraphQL
const schema = buildSchema(`
  type User {
    id: Int
    name: String
    email: String
    posts: [Post]
  }

  type Post {
    id: Int
    title: String
    content: String
    author: User
  }

  type Query {
    getUser(id: Int!): User
    getUsers: [User]
    getPost(id: Int!): Post
    getPosts: [Post]
  }

  input UserInput {
    name: String
    email: String
  }

  input PostInput {
    title: String
    content: String
    authorId: Int
  }

  type Mutation {
    createUser(input: UserInput): User
    createPost(input: PostInput): Post
  }
`);

// Definir los resolvers
const root = {
  getUser: async ({ id }) => {
    return prisma.user.findUnique({
      where: { id },
      include: { posts: true }
    });
  },
  getUsers: async () => {
    return prisma.user.findMany({
      include: { posts: true }
    });
  },
  getPost: async ({ id }) => {
    return prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });
  },
  getPosts: async () => {
    return prisma.post.findMany({
      include: { author: true }
    });
  },
  createUser: async ({ input }) => {
    return prisma.user.create({
      data: input
    });
  },
  createPost: async ({ input }) => {
    return prisma.post.create({
      data: input
    });
  }
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(4000, () => console.log('Server running on http://localhost:4000/graphql'));
