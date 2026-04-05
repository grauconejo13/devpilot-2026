import gql from "graphql-tag";

export const typeDefs = gql`
  type Project @key(fields: "id") {
    id: ID!
    name: String!
    description: String
    ownerId: ID!
    features: [Feature]
  }

  type Feature {
    id: ID!
    title: String!
    description: String
    projectId: ID!
    drafts: [Draft]
  }

  type Draft {
    id: ID!
    content: String!
    featureId: ID!
    createdAt: String!
  }

  type Query {
    myProjects: [Project]
    project(id: ID!): Project
    drafts(featureId: ID!): [Draft]
  }

  type Mutation {
    createProject(name: String!, description: String): Project
    addFeature(projectId: ID!, title: String!, description: String): Feature
    submitDraft(featureId: ID!, content: String!): Draft
  }
`;