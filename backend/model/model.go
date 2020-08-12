package model

import (
	"time"
)

type ObjectID string

type Model struct {
	ID        ObjectID  `gorm:"primary_key"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt *time.Time
}

type User struct {
	Model               // Automatically creates ID, CreatedAt, etc.
	FirebaseUID *string `gorm:"unique_index" json:"firebase_uid"`
	DisplayName *string `json:"display_name"`
}
