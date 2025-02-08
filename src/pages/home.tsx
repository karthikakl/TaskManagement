import * as React from "react";
import { useUserAuth } from "../context/userAuthContext";
import Header from "../components/Header";

interface IHomeProps {}

const Home: React.FunctionComponent<IHomeProps> = () => {
  const { logout, user } = useUserAuth();
  console.log('Home in user:', user);
  return (
      <Header />
  );
};

export default Home;
