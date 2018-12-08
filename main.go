package main

import (
	_ "bee-nov/models"
	_ "bee-nov/routers"

	"github.com/astaxie/beego"
)

func main() {
	beego.Run()
}
