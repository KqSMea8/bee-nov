package routers

import (
	"bee-nov/controllers"

	"github.com/astaxie/beego"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/book/:id", &controllers.BookController{})
	beego.Router("/bkloader/*", &controllers.BookController{}, "get:LoadMore")
}
