import { gql, ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: process.env.REACT_APP_BACKEND_URI + "/query",
  cache: new InMemoryCache()
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

export const GET_MENU_CATEGORIES = gql`
  query GetMenuCategories($menu_id: ID!) {
    menuCategories(menu_id: $menu_id) {
      title
      id
    }
  }
`;
