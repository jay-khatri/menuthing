package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/handlers"
	"github.com/rs/cors"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/jay-khatri/menuthing/backend/database"
	"github.com/jay-khatri/menuthing/backend/graph"
	"github.com/jay-khatri/menuthing/backend/graph/generated"
	"github.com/jay-khatri/menuthing/backend/graph/model"
	"github.com/jay-khatri/menuthing/backend/sessions"
)

const defaultPort = "8080"

func main() {
	seedFlag := flag.Bool("s", false, "seed the database")
	flag.Parse()

	db := database.SetupDB()
	resolver := &graph.Resolver{
		DB: db,
	}

	if *seedFlag {
		log.Println("seeding database")
		ctx := context.Background()
		// Create a Menu
		menu, err := resolver.Mutation().CreateMenu(ctx, "Saigon", "Saigon Restaurant")
		if err != nil {
			log.Fatalf("error creating menu: %v", err)
		}
		// Create Categories
		categories := []string{"Fish", "Chicken", "Appetizers"}
		categoryIDs := []model.ObjectID{}
		for i, c := range categories {
			category, err := resolver.Mutation().CreateMenuCategory(ctx, c, menu.ID)
			if err != nil {
				log.Fatalf("error creating category: %v", err)
			}
			for _, item := range []int{1, 2, 3, 4, 5, 6, 7, 8} {
				_, err := resolver.Mutation().CreateMenuItem(ctx, categories[i]+" "+strconv.Itoa(item), "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation", 1.23, menu.ID, category.ID)
				if err != nil {
					log.Fatalf("error creating menu item: %v", err)
				}
			}
			categoryIDs = append(categoryIDs, category.ID)
		}
		// Create some menu items for each category.
		log.Println("done seeding database")
		return
	}

	router := http.NewServeMux()

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{os.Getenv("FRONTEND_URI")},
		AllowCredentials: true,
		AllowedHeaders:   []string{"id-token", "content-type"},
	})

	// has ServeHTTP method, interface is of type http.Handler
	srv := handler.NewDefaultServer(
		generated.NewExecutableSchema(
			generated.Config{Resolvers: resolver}))

	router.Handle("/", playground.Handler("GraphQL playground", "/query"))
	router.Handle("/query", sessions.HandleUserSession(srv))

	loggedRouter := handlers.LoggingHandler(os.Stdout, router)
	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, c.Handler(loggedRouter)))
}
