import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
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
import { FaCircle } from "react-icons/fa";
import { createContainer } from "unstated-next";

import "./App.css";

function useOrderState(initialState = []) {
  let [orders, setOrder] = useState(initialState);
  let addOrderItem = id => {
    setOrder(orders.concat(id));
  };
  return { orders, addOrderItem };
}

let OrderState = createContainer(useOrderState);

function App() {
  return (
    <ApolloProvider client={client}>
      <OrderState.Provider>
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
      </OrderState.Provider>
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
  if (!category_id && data.menuCategories && data.menuCategories.length) {
    return (
      <Redirect to={`/${menu_id}/category/${data.menuCategories[0].id}`} />
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <div
        style={{
          flexDirection: "column",
          display: "flex",
          padding: 40,
          paddingLeft: 80,
          width: "70%",
          overflowY: "auto"
        }}
      >
        <div style={{ marginBottom: "auto", fontSize: 15, height: "10%" }}>
          <div>{menu_data.menu.title}</div>
        </div>
        <div style={{ height: "90%", fontSize: 30 }}>
          <div style={{ marginBottom: 20 }}>{menu_data.menu.title} Menu</div>
          <div
            style={{ marginBottom: 40, display: "flex", flexDirection: "row" }}
          >
            {data.menuCategories.map(category => {
              const notSelected = category_id !== category.id;
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginRight: 30
                  }}
                >
                  <Link
                    style={{
                      fontSize: 20,
                      textDecoration: "none",
                      fontWeight: notSelected ? "inherit" : 500,
                      color: notSelected ? "#888888" : "black"
                    }}
                    to={`/${menu_id}/category/${category.id}`}
                  >
                    {category.title}
                  </Link>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <FaCircle
                      style={{
                        visibility: notSelected && "hidden",
                        color: "#F5744B",
                        marginTop: 10,
                        height: 10
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <CategoryTab />
        </div>
      </div>
      <div
        style={{
          flexDirection: "column",
          display: "flex",
          padding: 40,
          width: "30%",
          borderLeft: "1px solid #DDDDDD"
        }}
      >
        <div
          style={{ marginBottom: "auto", fontSize: 15, height: "10%" }}
        ></div>
        <div
          style={{
            fontSize: 30,
            height: "90%",
            width: "100%"
          }}
        >
          <OrderPage />
        </div>
      </div>
    </div>
  );
}

const OrderPage = props => {
  let counter = OrderState.useContainer();
  return (
    <>
      <div
        style={{
          width: "100%",
          borderBottom: "1px solid #DDDDDD",
          paddingBottom: 10
        }}
      >
        Your Order
      </div>
      {counter.orders.map(i => (
        <>
          <div style={{ display: "flex", marginTop: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{i.title}</div>
            <div style={{ fontSize: 16, marginLeft: "auto", color: "#888888" }}>
              ${i.price}
            </div>
          </div>
          <div
            style={{
              color: "#F5744B",
              fontSize: 14,
              fontWeight: 500,
              marginTop: 5
            }}
          >
            EDIT
          </div>
        </>
      ))}
    </>
  );
};

const CategoryTab = props => {
  let counter = OrderState.useContainer();
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
  return (
    <div>
      {data.menuItems.map(item => {
        return (
          <div
            style={{
              marginTop: 15,
              border: "1px solid #DDDDDD",
              borderRadius: 8,
              overflowY: "auto",
              height: "100%",
              width: 500,
              padding: 17,
              cursor: "pointer"
            }}
            onClick={() => counter.addOrderItem(item)}
          >
            <div style={{ fontSize: 16, fontWeight: 600 }}>{item.title}</div>
            <div
              style={{
                marginTop: 10,
                fontSize: 16,
                fontWeight: 500,
                color: "#6F6F6F"
              }}
            >
              {item.description}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 16,
                fontWeight: 600,
                color: "#F5744B"
              }}
            >
              ${item.price}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default App;
