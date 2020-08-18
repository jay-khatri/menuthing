import React, { useState, useEffect } from "react";
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
  GET_ORDER_ITEMS,
  ADD_ORDER_ITEM,
  GET_MENU,
  GET_MENU_ITEM,
  GET_MENUS
} from "./graph.js";
import { ApolloProvider, useMutation, useQuery } from "@apollo/client";
import PuffLoader from "react-spinners/PuffLoader";
import { FaChevronDown } from "react-icons/fa";
import { createContainer } from "unstated-next";
import { Modal, Skeleton, Dropdown } from "antd";
import { Link as ScrollLink, Element } from "react-scroll";
import { useForm } from "react-hook-form";

import "antd/dist/antd.css";
import "./App.css";

const FullPageLoader = props => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <PuffLoader />
    </div>
  );
};

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
            <Route path="/:menu_id/cart">
              <CartPage />
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

const CartPage = props => {
  return <p>Checkout Page</p>;
};

function MenusPage() {
  const { loading, error, data } = useQuery(GET_MENUS);
  if (loading) {
    return <FullPageLoader />;
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

const MenuCartItem = props => {
  const { loading, error, data } = useQuery(GET_MENU_ITEM, {
    variables: {
      id: props.order_item.menu_item_id
    }
  });
  if (loading) {
    return <div />;
  }
  if (error) {
    return <div>{error.toString()}</div>;
  }
  return (
    <div style={{ marginTop: 15, display: "flex", flexDirection: "row" }}>
      <div
        style={{
          display: "flex",
          margin: 10,
          marginTop: 0,
          color: "#F5744B",
          fontWeight: 500
        }}
      >
        x{props && props.order_item && props.order_item.quantity}
      </div>
      <div style={{ width: "100%" }}>
        <div
          style={{
            fontSize: 16,
            color: "black",
            display: "flex",
            width: "100%",
            fontWeight: 500
          }}
        >
          <div>{data && data.menuItem && data.menuItem.title}</div>
          <div style={{ marginLeft: "auto", color: "#F5744B" }}>
            $
            {data &&
              data.menuItem &&
              data.menuItem.price * props.order_item.quantity}
          </div>
        </div>
        <div style={{ display: "flex", width: "100%" }}>
          <div>
            {props && props.order_item && props.order_item.instructions}
          </div>
        </div>
      </div>
    </div>
  );
};

const CartButton = props => {
  const { menu_id } = useParams();
  const { loading, error, data } = useQuery(GET_ORDER_ITEMS, {
    variables: {
      menu_id: menu_id
    }
  });
  if (loading) {
    return <div />;
  }
  if (error) {
    return <div>{error.toString()}</div>;
  }
  return (
    <Dropdown
      trigger={["click"]}
      overlay={
        <div
          style={{
            width: 400,
            backgroundColor: "white",
            boxShadow: "0px 0px 2px #888888",
            padding: 15,
            borderRadius: 8,
            height: "50%"
          }}
        >
          <div>
            <div
              style={{
                color: "black",
                fontWeight: 500,
                fontSize: 18
              }}
            >
              Your Cart
            </div>
            <div style={{ height: "50vh", overflowY: "scroll" }}>
              {data &&
                data.orderItems &&
                data.orderItems.map(item => <MenuCartItem order_item={item} />)}
            </div>
            <Link to={`/${menu_id}/cart`}>
              <div
                style={{
                  backgroundColor: "#F5744B",
                  height: 40,
                  width: "100%",
                  marginTop: 20,
                  marginLeft: "auto",
                  borderRadius: 20,
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    textAlign: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                    color: "white",
                    fontWeight: 600
                  }}
                >
                  Checkout / Edit Cart
                </div>
              </div>
            </Link>
          </div>
        </div>
      }
      placement="bottomLeft"
    >
      <div
        style={{
          backgroundColor: "#F5744B",
          height: 40,
          width: 100,
          marginLeft: "auto",
          borderRadius: 20,
          cursor: "pointer"
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            textAlign: "center",
            justifyContent: "center",
            height: "100%",
            color: "white",
            fontWeight: 600
          }}
        >
          Cart ({data?.orderItems?.length}) &nbsp; <FaChevronDown />
        </div>
      </div>
    </Dropdown>
  );
};
function MenuPage() {
  const { menu_id } = useParams();
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
    return <FullPageLoader />;
  }
  if (error || menu_error) {
    return (
      <div>
        <p>{JSON.stringify(error)}</p>
        <p>{JSON.stringify(menu_error)}</p>
      </div>
    );
  }
  return (
    <div className="menu-page">
      <div className="menu-page-container">
        <div className="nav-bar">
          <h3>{menu_data.menu.title}</h3>
          <CartButton />
        </div>
        <div className="menu-page-content">
          <h1>
            {menu_data.menu.title} Menu
          </h1>
          <div class="menu-nav-bar">
            {data.menuCategories.map(category => {
              return (
                <ScrollLink
                  activeClass="active"
                  className="category-link"
                  smooth={true}
                  to={category.id}
                  key={category.id}
                >
                {category.title}
                </ScrollLink>
              );
            })}
          </div>
          {data.menuCategories.map(category => {
            return (
              <Element name={category.id}>
                <div
                  style={{ marginBottom: 30 }}
                  id={category.id}
                  key={category.id}
                >
                  <h2>
                    {category.title}
                  </h2>
                  <CategorySection category_id={category.id} />
                </div>
              </Element>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const AddOrderItemForm = props => {
  const { menu_id } = useParams();
  const { item } = props;
  let [count, setCount] = useState(1);
  let [error, setError] = useState(undefined);
  const { handleSubmit, register } = useForm();
  const [addOrderItem, { loading }] = useMutation(ADD_ORDER_ITEM);
  const onSubmit = values => {
    addOrderItem({
      variables: {
        menu_id: menu_id,
        menu_item_id: item.id,
        quantity: count,
        instructions: values.instructions
      }
    })
      .then(resp => console.log(resp))
      .catch(err => setError(err));
  };

  useEffect(() => {
    if (error) {
      setError(error.toString());
    }
    if (!item) {
      setCount(1);
      setError(undefined);
    }
  }, [item, error]);

  if (!item) return <></>;
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div
        style={{
          padding: 20,
          fontSize: 20,
          color: "black",
          fontWeight: 500
        }}
      >
        {item.title}
      </div>
      <div
        style={{
          padding: 20,
          paddingTop: 0,
          fontSize: 14,
          color: "#555555"
        }}
      >
        {item.description}
      </div>
      <div
        style={{
          padding: 20,
          paddingTop: 0,
          paddingBottom: 5,
          fontSize: 16,
          color: "black",
          fontWeight: 500
        }}
      >
        Special Instructions
      </div>
      <div
        style={{
          borderBottom: "1px solid #DDDDDD"
        }}
      ></div>
      <input
        style={{
          width: "100%",
          border: "none",
          borderBottom: "1px solid #DDDDDD",
          outline: "none",
          padding: 20
        }}
        name="instructions"
        placeholder="Add instructions..."
        ref={register()}
      />
      <div style={{ fontWeight: 500, display: "flex" }}>
        <div
          style={{
            display: "flex",
            borderRadius: 50,
            border: "1px solid #DDDDDD",
            justifyContent: "space-between",
            alignItems: "center",
            height: 50,
            margin: 20,
            width: 175
          }}
        >
          <div
            style={{
              marginLeft: "auto",
              cursor: "pointer",
              textAlign: "center",
              width: 60
            }}
            onClick={() => {
              if (count > 1) {
                setCount(count - 1);
              }
            }}
          >
            -
          </div>
          <div style={{ textAlign: "center", width: 30 }}>{count}</div>
          <div
            style={{
              marginRight: "auto",
              cursor: "pointer",
              width: 60,
              textAlign: "center"
            }}
            onClick={() => setCount(count + 1)}
          >
            +
          </div>
        </div>
        <button
          type="submit"
          style={{
            display: "flex",
            borderRadius: 50,
            border: "1px solid #DDDDDD",
            backgroundColor: "#F5744B",
            color: "white",
            justifyContent: "space-between",
            flexGrow: 1,
            alignItems: "center",
            height: 50,
            margin: 20,
            textAlign: "center",
            outline: "none"
          }}
        >
          <div
            style={{
              marginRight: "auto",
              cursor: "pointer",
              width: "100%",
              fontWeight: 500
            }}
          >
            {loading ? (
              <PuffLoader />
            ) : (
              "Add to Cart ($" + (count * item.price).toString() + ")"
            )}
          </div>
        </button>
      </div>
      {error && (
        <div style={{ padding: 20, paddingTop: 5 }}>{error.toString()}</div>
      )}
    </form>
  );
};

const CategorySection = props => {
  const { menu_id } = useParams();
  let [selectedItem, setSelectedItem] = useState(undefined);
  const { loading, error, data } = useQuery(GET_MENU_ITEMS, {
    variables: {
      menu_id: menu_id,
      menu_category_id: props.category_id
    }
  });
  if (loading) {
    return <Skeleton />;
  }
  if (error) {
    return <p>{JSON.stringify(error)}</p>;
  }
  return (
    <div>
      <Modal
        title={null}
        style={{ width: 500 }}
        visible={selectedItem !== undefined}
        footer={null}
        onCancel={() => {
          setSelectedItem(undefined);
        }}
      >
        <AddOrderItemForm item={selectedItem} />
      </Modal>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap"
        }}
      >
        {data.menuItems.map(item => {
          return (
            <div
              onClick={() => setSelectedItem(item)}
              key={item.id}
              className="menu-item"
            >
              <h4 style={{ fontSize: 16, fontWeight: 600, color: "black" }}>
                {item.title}
              </h4>
              <p>
                {item.description}
              </p>
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
    </div>
  );
};

export default App;
