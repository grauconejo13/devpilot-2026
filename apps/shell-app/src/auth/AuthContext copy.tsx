import { createContext, useContext } from "react";
import { useQuery } from "@apollo/client";
import { CURRENT_USER } from "../graphql/auth";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
const { data, loading, refetch } = useQuery(CURRENT_USER, {
  fetchPolicy: "network-only",
});

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