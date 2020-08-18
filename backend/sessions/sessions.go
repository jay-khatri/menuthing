package sessions

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gofrs/uuid"
	"github.com/gorilla/sessions"
	"gopkg.in/boj/redistore.v1"
)

var store *redistore.RediStore

func init() {
	// Fetch new store.
	s, err := redistore.NewRediStore(10, "tcp", os.Getenv("REDIS_ADDRESS"), "", []byte("here-is-some-secret-stuff"))
	if err != nil {
		log.Fatalf(fmt.Sprintf("error connecting to redis instance w/ address %v: %v", os.Getenv("REDIS_ADDRESS"), err))
	}
	s.Options = &sessions.Options{
		HttpOnly: true,
		// Expires every 10 years.
		MaxAge: 10 * 365 * 24 * 60 * 60,
	}
	store = s
}

func HandleUserSession(h http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "session")
		// Add a value.
		if session.IsNew {
			u, err := uuid.NewV4()
			if err != nil {
				w.Write([]byte(fmt.Sprintf("error generating uuid: %v", err)))
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
			session.Values["id"] = u.String()
			if err = session.Save(r, w); err != nil {
				w.Write([]byte(fmt.Sprintf("error saving session: %v", err)))
				w.WriteHeader(http.StatusUnauthorized)
				return
			}
		} else if session.Values["id"] == "" {
			w.Write([]byte("got an empty, non-new session"))
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), "id", session.Values["id"])
		h.ServeHTTP(w, r.WithContext(ctx))
		return
	}
}
