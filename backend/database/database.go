package database

import (
	"fmt"
	"os"

	"github.com/jay-khatri/menuthing/backend/graph/model"
	"github.com/jinzhu/gorm"

	log "github.com/sirupsen/logrus"

	_ "github.com/jinzhu/gorm/dialects/postgres"
)

func SetupDB() *gorm.DB {
	psqlConf := fmt.Sprintf("host=%s port=5432 user=%s dbname=%s password=%s sslmode=disable",
		os.Getenv("PSQL_HOST"),
		os.Getenv("PSQL_USER"),
		os.Getenv("PSQL_DB"),
		os.Getenv("PSQL_PASSWORD"))

	// Start the database.
	log.Println("Connecting to database...")
	db, err := gorm.Open("postgres", psqlConf)
	if err != nil {
		log.Fatal("Failed to connect to database: " + err.Error())
	}
	log.Println("Auto migrating database...")
	db.AutoMigrate(
		&model.Menu{},
		&model.Order{},
		&model.OrderItem{},
		&model.MenuItem{},
		&model.MenuCategory{},
	)
	log.Println("Finished migrating database.")
	return db
}
