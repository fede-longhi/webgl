package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	fmt.Println("Hi I'm initializing")
	fs := http.FileServer(http.Dir("./src"))
	http.Handle("/", fs)

	log.Println("Listening on :3000...")
	err := http.ListenAndServe(":3000", nil)
	if err != nil {
		log.Fatal(err)
	}
}
