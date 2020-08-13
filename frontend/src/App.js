import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";
import {
  client,
  GET_MENU_ITEMS,
  GET_MENU_CATEGORIES,
  GET_MENU,
  GET_MENUS
} from "./graph.js";
import { ApolloProvider, useQuery } from "@apollo/client";
import PuffLoader from "react-spinners/PuffLoader";

import "./App.css";

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Switch>
          <Route path="/:menu_id/category/:category_id">
            <MenuPage />
          </Route>
          <Route path="/:menu_id">
            <MenuPage />
          </Route>
          <Route path="/">
            <MenusPage />
          </Route>
        </Switch>
      </Router>
    </ApolloProvider>
  );
}

function MenusPage() {
  const { loading, error, data } = useQuery(GET_MENUS);
  if (loading) {
    return <PuffLoader />;
  }
  if (error) {
    return <p>{JSON.stringify(error)}</p>;
  }
  return (
    <p>
      {data.menus.map(menu => {
        return <Link to={`/${menu.id}`}>{menu.title}</Link>;
      })}
    </p>
  );
}

function MenuPage() {
  const { menu_id } = useParams();
  let { category_id } = useParams();
  const {
    loading: menu_loading,
    error: menu_error,
    data: menu_data
  } = useQuery(GET_MENU, {
    variables: {
      id: menu_id
    }
  });
  const { loading, error, data } = useQuery(GET_MENU_CATEGORIES, {
    variables: {
      menu_id: menu_id
    }
  });
  if (loading || menu_loading) {
    return <PuffLoader />;
  }
  if (error || menu_error) {
    return (
      <div>
        <p>{JSON.stringify(error)}</p>
        <p>{JSON.stringify(menu_error)}</p>
      </div>
    );
  }
  if (!category_id && data.menuCategories.length) {
    category_id = data.menuCategories[0].id;
  }
  return (
    <div
      style={{
        flexDirection: "column",
        display: "flex",
        height: "100vh",
        margin: 40,
        width: "100vw"
      }}
    >
      <div style={{ marginBottom: "auto", fontSize: 15, height: "10%" }}>
        <div>{menu_data.menu.title}</div>
      </div>
      <div style={{ height: "90%", fontSize: 30 }}>
        <div style={{ marginBottom: 20 }}>{menu_data.menu.title} Menu</div>
        {data.menuCategories.map(category => {
          return (
            <Link
              style={{
                fontSize: 20,
                marginRight: 30,
                textDecoration: "none",
                color: "inherit"
              }}
              to={`/${menu_id}/category/${category.id}`}
            >
              {category.title}
            </Link>
          );
        })}
        <CategoryTab />
      </div>
    </div>
  );
}

const CategoryTab = props => {
  const { menu_id, category_id } = useParams();
  const { loading, error, data } = useQuery(GET_MENU_ITEMS, {
    variables: {
      menu_id: menu_id,
      menu_category_id: category_id
    }
  });
  if (loading) {
    return <PuffLoader />;
  }
  if (error) {
    return <p>{JSON.stringify(error)}</p>;
  }
  console.log(data);
  return (
    <div>
      {data.menuItems.map(item => {
        return (
          <div
            style={{
              marginTop: 15,
              border: "1px solid #DDDDDD",
              borderRadius: 15,
              width: 500,
              padding: 10
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600 }}>{item.title}</div>
            <div style={{ fontSize: 16 }}>{item.description}</div>
          </div>
        );
      })}
    </div>
  );
};

export default App;
