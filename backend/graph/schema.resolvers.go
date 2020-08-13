package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	e "github.com/pkg/errors"

	"github.com/jay-khatri/menuthing/backend/graph/generated"
	"github.com/jay-khatri/menuthing/backend/graph/model"
)

func (r *mutationResolver) CreateMenu(ctx context.Context, title string, description string) (*model.Menu, error) {
	menu := &model.Menu{
		Title:       &title,
		Description: &description,
	}
	if err := r.DB.Create(menu).Error; err != nil {
		return nil, e.Wrap(err, "error creating menu")
	}
	return menu, nil
}

func (r *mutationResolver) CreateMenuItem(ctx context.Context, title string, description string, menuID model.ObjectID, menuCategoryID model.ObjectID) (*model.MenuItem, error) {
	menuItem := &model.MenuItem{
		Title:          &title,
		Description:    &description,
		MenuID:         menuID,
		MenuCategoryID: menuCategoryID,
	}
	if err := r.DB.Create(menuItem).Error; err != nil {
		return nil, e.Wrap(err, "error creating menu item")
	}
	return menuItem, nil
}

func (r *mutationResolver) CreateMenuCategory(ctx context.Context, title string, menuID model.ObjectID) (*model.MenuCategory, error) {
	menuCategory := &model.MenuCategory{
		Title:  &title,
		MenuID: menuID,
	}
	if err := r.DB.Create(menuCategory).Error; err != nil {
		return nil, e.Wrap(err, "error creating menu category")
	}
	return menuCategory, nil
}

func (r *queryResolver) Menus(ctx context.Context) ([]*model.Menu, error) {
	menus := []*model.Menu{}
	res := r.DB.Find(&menus)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "no menus exist")
	}
	return menus, nil
}

func (r *queryResolver) Menu(ctx context.Context, id model.ObjectID) (*model.Menu, error) {
	menu := &model.Menu{}
	res := r.DB.Where(&model.Menu{Model: model.Model{ID: id}}).First(&menu)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "menu doesn't exist")
	}
	return menu, nil
}

func (r *queryResolver) MenuItems(ctx context.Context, menuID model.ObjectID, menuCategoryID *model.ObjectID) ([]*model.MenuItem, error) {
	menu, err := r.Query().Menu(ctx, menuID)
	if err != nil {
		return nil, e.Wrap(err, "can't fetch menu")
	}
	menuItems := []*model.MenuItem{}
	res := r.DB.Model(menu).Related(&menuItems)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "can't get related menu items")
	}
	parsedItems := []*model.MenuItem{}
	for _, m := range menuItems {
		if menuCategoryID == nil {
			parsedItems = append(parsedItems, m)
		} else if m.MenuCategoryID == *menuCategoryID {
			parsedItems = append(parsedItems, m)
		}
	}
	return parsedItems, nil
}

func (r *queryResolver) MenuCategories(ctx context.Context, menuID model.ObjectID) ([]*model.MenuCategory, error) {
	menu, err := r.Query().Menu(ctx, menuID)
	if err != nil {
		return nil, e.Wrap(err, "can't fetch menu")
	}
	menuCategories := []*model.MenuCategory{}
	res := r.DB.Model(menu).Related(&menuCategories)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "can't get related menu categories")
	}
	return menuCategories, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
