package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/jay-khatri/menuthing/backend/graph/generated"
	"github.com/jay-khatri/menuthing/backend/graph/model"
)

func (r *mutationResolver) CreateMenu(ctx context.Context, menuID string) (*model.Menu, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) CreateMenuItem(ctx context.Context, menuID string) (*model.Menu, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *mutationResolver) EditMenuItem(ctx context.Context, menuItemID string) ([]*model.MenuItem, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Menu(ctx context.Context, menuID string) (*model.Menu, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) MenuItems(ctx context.Context, menuID string) ([]*model.MenuItem, error) {
	panic(fmt.Errorf("not implemented"))
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
