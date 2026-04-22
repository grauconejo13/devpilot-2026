import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query GetProjects {
    myProjects {
      id
      name
      description
      features {
        id
        title
      }
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;
export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String) {
    createProject(name: $name, description: $description) {
      id
      name
    }
  }
`;

export const CREATE_FEATURE = gql`
  mutation CreateFeature(
    $projectId: ID!
    $title: String!
    $description: String
  ) {
    addFeature(
      projectId: $projectId
      title: $title
      description: $description
    ) {
      id
      title
    }
  }
`;

export const GET_DRAFTS = gql`
  query GetDrafts($featureId: ID!) {
    drafts(featureId: $featureId) {
      id
      content
      createdAt
    }
  }
`;

export const SUBMIT_DRAFT = gql`
  mutation SubmitDraft($featureId: ID!, $content: String!) {
    submitDraft(featureId: $featureId, content: $content) {
      id
      content
    }
  }
`;