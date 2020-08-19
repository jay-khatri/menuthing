package main

import (
	"flag"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/rs/cors"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/jay-khatri/menuthing/backend/database"
	"github.com/jay-khatri/menuthing/backend/graph"
	"github.com/jay-khatri/menuthing/backend/graph/generated"
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
		seed(resolver)
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
