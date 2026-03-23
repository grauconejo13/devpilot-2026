import { createContext, useContext } from "react";
import { useQuery, gql } from "@apollo/client";

const CURRENT_USER = gql`
  query {
    currentUser {
      id
      username
      email
      role
    }
  }
`;

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const { data, loading, refetch } = useQuery(CURRENT_USER);

  return (
    <AuthContext.Provider
      value={{
        user: data?.currentUser,
        loading,
        refetchUser: refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);