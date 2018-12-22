package main

import (
	_ "bee-nov/models"
	_ "bee-nov/routers"

	"github.com/astaxie/beego"
)

func hello(in int) (out int) {
	if in < 2 {
		out = 4
	} else {
		out = 5
	}
	return
}

func main() {
	beego.AddFuncMap("hi", hello)
	beego.Run()
}
