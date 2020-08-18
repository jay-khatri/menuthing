package main

import (
	"context"
	"log"
	"strconv"

	"github.com/jay-khatri/menuthing/backend/graph"
	"github.com/jay-khatri/menuthing/backend/graph/model"
)

func seed(resolver *graph.Resolver) {
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
}
