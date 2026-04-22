import { gql } from "@apollo/client";

// =====================
// GET PROJECTS
// =====================
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

// =====================
// CREATE PROJECT
// =====================
export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String) {
    createProject(name: $name, description: $description) {
      id
      name
      description
    }
  }
`;