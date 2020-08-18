package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"log"

	"github.com/jay-khatri/menuthing/backend/graph/generated"
	"github.com/jay-khatri/menuthing/backend/graph/model"
	e "github.com/pkg/errors"
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

func (r *mutationResolver) CreateMenuItem(ctx context.Context, title string, description string, price float64, menuID model.ObjectID, menuCategoryID model.ObjectID) (*model.MenuItem, error) {
	menuItem := &model.MenuItem{
		Title:          &title,
		Description:    &description,
		MenuID:         menuID,
		MenuCategoryID: menuCategoryID,
		Price:          &price,
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

func (r *mutationResolver) AddOrderItem(ctx context.Context, menuID model.ObjectID, menuItemID model.ObjectID, quantity int, instructions string) (*model.OrderItem, error) {
	// retrieve/create an order unique to a user and menu.
	sessionID := ctx.Value("id").(string)
	order := &model.Order{}
	res := r.DB.Where(&model.Order{
		SessionID: &sessionID,
		MenuID:    menuID}).First(&order)
	if err := res.Error; err != nil || res.RecordNotFound() {
		log.Println("order doesn't exist")
		order.SessionID = &sessionID
		order.MenuID = menuID
		if err := r.DB.Create(order).Error; err != nil {
			return nil, e.Wrap(err, "error creating menu")
		}
	}
	// make sure there aren't multiple orders with the same menu item.
	orderItems := []*model.OrderItem{}
	if res := r.DB.Model(order).Related(&orderItems); res.Error != nil {
		return nil, fmt.Errorf("error getting related order items: %v", res)
	}
	for _, item := range orderItems {
		if item.MenuItemID == menuItemID {
			return nil, fmt.Errorf("There already exists an order item with this menu item")
		}
	}
	//create
	newOrderItem := &model.OrderItem{
		OrderID:      order.ID,
		MenuItemID:   menuItemID,
		Quantity:     &quantity,
		Instructions: &instructions,
	}
	if err := r.DB.Create(newOrderItem).Error; err != nil {
		return nil, fmt.Errorf("error creating secret association for repo: " + err.Error())
	}
	return newOrderItem, nil
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

func (r *queryResolver) MenuItem(ctx context.Context, id model.ObjectID) (*model.MenuItem, error) {
	menuItem := &model.MenuItem{}
	res := r.DB.Where(&model.MenuItem{Model: model.Model{ID: id}}).First(&menuItem)
	if err := res.Error; err != nil || res.RecordNotFound() {
		return nil, e.Wrap(err, "can't get menu item")
	}
	return menuItem, nil
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
	return menuItems, nil
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

func (r *queryResolver) OrderItems(ctx context.Context, menuID model.ObjectID) ([]*model.OrderItem, error) {
	sessionID := ctx.Value("id").(string)
	order := &model.Order{}
	res := r.DB.Where(&model.Order{
		SessionID: &sessionID,
		MenuID:    menuID}).First(&order)
	if err := res.Error; err != nil || res.RecordNotFound() {
		log.Println("order doesn't exist")
		order.SessionID = &sessionID
		order.MenuID = menuID
		if err := r.DB.Create(order).Error; err != nil {
			return nil, e.Wrap(err, "error creating menu")
		}
	}
	orderItems := []*model.OrderItem{}
	if res := r.DB.Model(order).Related(&orderItems); res.Error != nil {
		return nil, e.Wrap(res.Error, "error getting related order items")
	}
	return orderItems, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
