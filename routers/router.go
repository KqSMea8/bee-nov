package routers

import (
	"bee-nov/controllers"

	"github.com/astaxie/beego"
)

func init() {
	beego.Router("/", &controllers.MainController{})
	beego.Router("/book/:id:int", &controllers.BookController{})
	beego.Router("/book/category/page/*", &controllers.BookController{}, "get:CategoryPage")
	beego.Router("/bkloader/*", &controllers.BookController{}, "get:LoadMore")
	beego.Router("/chapter/:id", &controllers.ChapterController{})
	beego.Router("/c/*", &controllers.StFileController{})
}
