package model

import (
	"strings"
	"time"

	"encoding/base64"

	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

type ObjectID string

var escaper = strings.NewReplacer("9", "99", "-", "90", "_", "91")

type Model struct {
	ID        ObjectID  `gorm:"primary_key"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt *time.Time
}

type Order struct {
	Model
	SessionID  *string      `json:"session_id"`
	OrderItems []*OrderItem `gorm:"foreignkey:OrderID:association_foreignkey:ID"`
	MenuID     ObjectID
}

type OrderItem struct {
	Model
	MenuItemID   ObjectID `json:"menu_item_id"`
	Quantity     *int     `json:"quantity"`
	Instructions *string  `json:"instructions"`
	OrderID      ObjectID
}

type Menu struct {
	Model
	Title          *string         `json:"title"`
	Description    *string         `json:"description"`
	MenuItems      []*MenuItem     `gorm:"foreignkey:MenuID:association_foreignkey:ID"`
	MenuCategories []*MenuCategory `gorm:"foreignkey:MenuID:association_foreignkey:ID"`
	Orders         []*OrderItem    `gorm:"foreignkey:MenuID:association_foreignkey:ID"`
}

type MenuItem struct {
	Model
	Title          *string  `json:"title"`
	Description    *string  `json:"description"`
	Price          *float64 `json: "price"`
	MenuCategoryID ObjectID
	MenuID         ObjectID
}

type MenuCategory struct {
	Model
	Title  *string `json:"title"`
	MenuID ObjectID
}

func (base *Model) BeforeCreate(scope *gorm.Scope) error {
	u, err := uuid.NewV4()
	if err != nil {
		return err
	}
	return scope.SetColumn("ID", strings.ToLower(escaper.Replace(base64.RawURLEncoding.EncodeToString(u.Bytes()))))
}
