import { gql, ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: process.env.REACT_APP_BACKEND_URI + "/query",
  cache: new InMemoryCache(),
  credentials: "include"
});

export const GET_MENUS = gql`
  query GetMenus {
    menus {
      id
      title
    }
  }
`;

export const GET_MENU = gql`
  query GetMenu($id: ID!) {
    menu(id: $id) {
      title
      id
    }
  }
`;

export const GET_MENU_ITEMS = gql`
  query GetMenuItems($menu_id: ID!, $menu_category_id: ID) {
    menuItems(menu_id: $menu_id, menu_category_id: $menu_category_id) {
      title
      description
      id
      price
    }
  }
`;

export const GET_MENU_ITEM = gql`
  query GetMenuItem($id: ID!) {
    menuItem(id: $id) {
      title
      id
      price
    }
  }
`;

export const GET_MENU_CATEGORIES = gql`
  query GetMenuCategories($menu_id: ID!) {
    menuCategories(menu_id: $menu_id) {
      title
      id
    }
  }
`;

export const ADD_ORDER_ITEM = gql`
  mutation AddOrderItem(
    $menu_id: ID!
    $menu_item_id: ID!
    $quantity: Int!
    $instructions: String!
  ) {
    addOrderItem(
      menu_id: $menu_id
      menu_item_id: $menu_item_id
      quantity: $quantity
      instructions: $instructions
    ) {
      id
      menu_item_id
    }
  }
`;

export const GET_ORDER_ITEMS = gql`
  query GetOrderItems($menu_id: ID!) {
    orderItems(menu_id: $menu_id) {
      id
      quantity
      instructions
      menu_item_id
    }
  }
`;
