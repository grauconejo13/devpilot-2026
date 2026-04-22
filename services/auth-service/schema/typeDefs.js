import gql from 'graphql-tag';

export const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.0"
      import: ["@key", "@shareable"]
    )

  type User @key(fields: "id") {
    id: ID!
    username: String!
    email: String!
    role: String!
  }

  type AuthPayload {
    user: User
    message: String!
  }

  type LogoutPayload {
    message: String!
  }

  type Query {
    currentUser: User
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: LogoutPayload!
  }
`;
